import mongoose, { Connection } from 'mongoose';
import { glob } from 'glob';
import path from 'path';

import { DB_DATABASE, DB_HOST, DB_PORT } from '@config/index';

const dbConnection = {
  url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
};

if (process.env.DB_USER && process.env.DB_PASSWORD) {
  dbConnection.url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
}

mongoose.set('debug', true);

const dbCreatedConnection: Connection = mongoose.createConnection(dbConnection.url);

dbCreatedConnection.on('connected', () => {
  console.log('Connected to Database');
});

dbCreatedConnection.on('error', e => {
  console.error(e);
});

// Dynamic schema loading
const loadSchemas = async () => {
  try {
    // Find all schema files in plugins/*/schema
    const schemaFiles = await glob('src/plugins/*/schema/*.ts');

    for (const file of schemaFiles) {
      // Skip non-schema files like index.ts or interface files
      if (file.includes('.interface.') || file === 'index.ts') continue;

      try {
        // Convert file path to module path
        const modulePath = './' + file.replace(/\.ts$/, '');
        
        // Import the schema
        const schema = await import(modulePath);
        
        // Get the model name from file name (without extension)
        const modelName = path.basename(file, '.ts');
        
        // Get schema variable name based on conventional naming
        const schemaKey = Object.keys(schema).find(key => key.toLowerCase().includes('schema'));
        if (!schemaKey) {
          console.log(`No schema found in ${file}`);
          continue;
        }

        // Register model with dbInstance if not already registered
        if (!dbCreatedConnection.models[modelName]) {
          dbCreatedConnection.model(modelName, schema[schemaKey], modelName);
          console.log(`Registered schema: ${modelName}`);
        }
      } catch (importError) {
        console.error(`Error importing schema ${file}:`, importError);
      }
    }
  } catch (error) {
    console.error('Error loading schemas:', error);
  }
};

// Load schemas when database connects
dbCreatedConnection.on('connected', () => {
  loadSchemas().catch(err => {
    console.error('Failed to load schemas:', err);
  });
});

export const dbInstance = dbCreatedConnection;
export const models = dbInstance.models;