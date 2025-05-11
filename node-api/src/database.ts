import mongoose, { Connection, Model } from 'mongoose';
import { glob } from 'glob';
import path from 'path';
import { Container } from 'inversify';
import { DB_DATABASE, DB_HOST, DB_PORT } from '@config/index';
import { logger } from '@utils/logger';
import { toContainerName } from '@utils/index';

const dbConnection = {
  url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
};

if (process.env.DB_USER && process.env.DB_PASSWORD) {
  dbConnection.url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
}

mongoose.set('debug', true);

const dbCreatedConnection: Connection = mongoose.createConnection(dbConnection.url);

dbCreatedConnection.on('connected', () => {
  logger.info('🚀 Connected to Database');
});

dbCreatedConnection.on('error', e => {
  logger.error('❌ Database connection error:', e);
});

// Utility function to find schema file paths
const findSchemaFiles = async (): Promise<string[]> => {
  return await glob('src/plugins/*/schema/*.ts');
};

// Utility function to get model name from file path
const getModelName = (file: string): string => {
  return path.basename(file, '.ts');
};

// Utility function to convert file path to module path
const getModulePath = (file: string): string => {
  return './' + file.replace(/\.ts$/, '');
};

// Load custom schema configuration for a plugin
const loadCustomSchemaConfig = async (pluginName: string) => {
  try {
    const customConfigPath = path.join('../src/schemas', pluginName, `${pluginName}.custom.schema`);
    const customConfig = await import(customConfigPath);
    return {
      customSchema: customConfig.customSchema || {},
      customRelatedModels: customConfig.customRelatedModels?.relatedModels || []
    };
  } catch (error) {
    logger.info(`ℹ️  No custom schema found for ${pluginName}, using defaults`);
    return { customSchema: {}, customRelatedModels: [] };
  }
};

// Handle related model registration
const handleRelatedModels = async (
  modelNames: string[],
  dbConnection: Connection
): Promise<Model<any>[]> => {
  return await Promise.all(
    modelNames.map(async (modelName) => {
      if (!dbConnection.models[modelName]) {
        const relatedSchemaPath = glob.sync(`src/plugins/*/schema/${modelName}.ts`)[0];
        if (relatedSchemaPath) {
          await registerModelFromPath(relatedSchemaPath, dbConnection);
        }
      }
      return dbConnection.models[modelName];
    })
  );
};

// Register model using SchemaCreator
const registerModelWithSchemaCreator = async (
  schema: any,
  modelName: string,
  pluginName: string,
  dbConnection: Connection
) => {
  try {
    const { customSchema, customRelatedModels } = await loadCustomSchemaConfig(pluginName);
    const relatedModels = await handleRelatedModels(customRelatedModels, dbConnection);
    
    const customizedSchema = schema.SchemaCreator(customSchema, { relatedModels });
    
    if (!dbConnection.models[modelName]) {
      const model = dbConnection.model(modelName, customizedSchema, modelName);
      logger.info(`📦 Registered schema: ${modelName} (${
        Object.keys(customSchema).length ? '🔧 custom schema' : ''
      }${relatedModels.length ? ' 🔗 related models' : ' 📄 defaults'})`);
      return model;
    }
    return dbConnection.models[modelName];
  } catch (error) {
    logger.error(`❌ Error creating schema for ${modelName}:`, error);
    return await registerModelWithFallback(schema, modelName, dbConnection);
  }
};

// Register model using direct schema export
const registerModelWithFallback = async (
  schema: any,
  modelName: string,
  dbConnection: Connection
) => {
  const schemaKey = Object.keys(schema).find(key => key.toLowerCase().includes('schema'));
  if (schemaKey && !dbConnection.models[modelName]) {
    dbConnection.model(modelName, schema[schemaKey], modelName);
    logger.info(`📦 Registered schema: ${modelName} (📄 fallback export)`);
  }
};

// Attach model to plugin container
const attachModelToContainer = async (modelName: string, pluginName: string, model: Model<any>) => {
  try {
    const containerName = toContainerName(pluginName);
    const containerPath = `../src/plugins/${pluginName}/${containerName}`;
    const containerModule = await import(containerPath);
    const container = containerModule[containerName] as Container;
    
    if (container) {
      if (!container.isBound(`${modelName}Collection`)) {
        container.bind(`${modelName}Collection`).toConstantValue(model);
        logger.info(`🔗 Attached ${modelName}Collection to ${pluginName}Container`);
      }
    }
  } catch (error) {
    logger.info(`⚠️ No container found for plugin ${pluginName}`);
  }
};

// Register a single model from a file path
const registerModelFromPath = async (file: string, dbConnection: Connection) => {
  if (file.includes('.interface.') || file === 'index.ts') return;
  
  try {
    const modulePath = getModulePath(file);
    const schema = await import(path.join('../', modulePath));
    const modelName = getModelName(file);
    const pluginName = path.dirname(file).split(path.sep)[2];

    let model;
    if (schema.SchemaCreator) {
      await registerModelWithSchemaCreator(schema, modelName, pluginName, dbConnection);
      model = dbConnection.models[modelName];
    } else {
      const schemaKey = Object.keys(schema).find(key => key.toLowerCase().includes('schema'));
      if (!schemaKey) {
        logger.info(`⚠️ No schema found in ${file}`);
        return;
      }
      
      if (!dbConnection.models[modelName]) {
        model = dbConnection.model(modelName, schema[schemaKey], modelName);
        logger.info(`📦 Registered schema: ${modelName} (📄 direct export)`);
      } else {
        model = dbConnection.models[modelName];
      }
    }
    
    // Attach model to plugin container
    if (model) {
      await attachModelToContainer(modelName, pluginName, model);
    }
  } catch (error) {
    logger.error(`❌ Error importing schema ${file}:`, error);
  }
};

// Main function to load all schemas
const loadSchemas = async () => {
  try {
    const schemaFiles = await findSchemaFiles();
    logger.info(`📂 Found ${schemaFiles.length} schema files`);
    
    for (const file of schemaFiles) {
      await registerModelFromPath(file, dbCreatedConnection);
    }
  } catch (error) {
    logger.error('❌ Error loading schemas:', error);
  }
};

// Load schemas when database connects
dbCreatedConnection.on('connected', () => {
  logger.info('🔄 Database connection established. Loading schemas...');
  loadSchemas().catch(err => {
    logger.error('❌ Failed to load schemas:', err);
  });
});

// Export the database instance and models
export const dbInstance = dbCreatedConnection;
export const models = dbInstance.models;
