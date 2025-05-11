import { Application, Router } from 'express';
import { versionAndLanguageMiddleware } from '@middlewares/versionAndLanguage.middleware';
import IndexRoute from '@routes/index.route';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@utils/logger';

interface Layer {
  route?: {
    path: string;
    stack: { method: string }[];
  };
}

export const initializeRoutes = async (app: Application) => {
  // Add version and language middleware
  app.use('/:version/:language', versionAndLanguageMiddleware);

  logger.info('🚦 === Initializing Routes ===');

  // Initialize base routes
  const routes = [
    IndexRoute
  ];

  routes.forEach(Route => {
    const route = new Route();
    app.use('/:version/:language', route.router);
    
    // Log base routes
    route.router.stack.forEach((layer: Layer) => {
      if (layer.route) {
        const methods = layer.route.stack
          .map(r => r.method.toUpperCase())
          .join(', ');
        logger.info(`🔌 [Base] ${methods} /:version/:language${layer.route.path}`);
      }
    });
  });

  // Initialize plugin routes
  const pluginsDir = path.join(__dirname, '../plugins');
  const plugins = fs.readdirSync(pluginsDir).filter(file => 
    fs.statSync(path.join(pluginsDir, file)).isDirectory()
  );

  logger.info('🔧 === Loading Plugin Routes ===');

  for (const plugin of plugins) {
    try {
      const pluginPath = path.join(pluginsDir, plugin);
      const { RouteCreator } = await import(pluginPath);

      if (typeof RouteCreator === 'function') {
        const router = Router();
        
        // Try to import validation rules if they exist
        let validationRules;
        try {
          validationRules = await import(`@validations/rules/${plugin}.validation`);
        } catch (error) {
          // Validation rules are optional, so we can continue if they don't exist
          logger.debug(`📝 No validation rules found for plugin ${plugin}`);
        }

        // Initialize plugin routes with base path and validation rules
        RouteCreator(`/${plugin}/`, router, validationRules);

        // Log plugin routes before mounting
        router.stack.forEach((layer: Layer) => {
          if (layer.route) {
            const methods = layer.route.stack
              .map(r => r.method.toUpperCase())
              .join(', ');
            logger.info(`🧩 [Plugin: ${plugin}] [${methods}] /:version/:language${layer.route.path}`);
          }
        });

        // Mount the plugin router
        app.use('/:version/:language', router);
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        logger.error(`❌ Failed to load plugin routes from ${plugin}: ${error.message}`);
      } else {
        logger.error(`❌ Failed to load plugin routes from ${plugin}: Unknown error`);
      }
    }
  }

  logger.info('✅ === Route Initialization Complete ===');
};
