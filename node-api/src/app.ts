import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import path = require('path');
import { models } from './database';
// import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
import { LOG_FORMAT, NODE_ENV, PORT, SITE_DOMAIN } from '@config/index';
import './database';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { Logger } from 'winston';
import { Request } from 'express';
import 'reflect-metadata';
import { initializeRoutes } from './routes';

type corsOptions = { origin: boolean; credentials?: boolean };

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = NODE_ENV;
    this.port = PORT;

    this.initializeMiddlewares();
    // Initialize routes after schema loading
    this.initializeRoutesAfterSchemaLoad();
    
    // this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializePublicFolder();
  }

  private async initializeRoutesAfterSchemaLoad() {
    // Wait for database connection and schema loading
    await new Promise<void>((resolve, reject) => {
      const TIMEOUT = 30000; // 30 seconds timeout
      
      // Create a wrapper for logger.info
      const originalLogger = Object.create(logger);
      const infoWrapper = (originalLogger.info as Function).bind(logger);

      const wrappedInfo: Logger['info'] = function(message: any, ...args: any[]) {
        if (message === '🔄 Database connection established. Loading schemas...') {
          // Wait 2 seconds after database connection to ensure schemas are attached
          setTimeout(() => {
            logger.info = infoWrapper;
            resolve();
          }, 1000);
        }
        return infoWrapper(message, ...args);
      };

      // Set the wrapped logger
      logger.info = wrappedInfo;

      // Set a timeout
      setTimeout(() => {
        logger.info = infoWrapper;
        reject(new Error('Database connection timeout after 30 seconds'));
      }, TIMEOUT);
    });

    // Initialize routes after schemas are loaded
    initializeRoutes(this.app);
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    const whitelist = SITE_DOMAIN.split(',').map(_ => _.trim());
    const corsOptionsDelegate = function (req: Request, callback: Function) {
      var corsOptions: corsOptions;
      if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true, credentials: true };
      }  else {
        corsOptions = { origin: false };
      }
      callback(null, corsOptions);
    };

    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors(corsOptionsDelegate));
    this.app.use(hpp());
    this.app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  // private initializeSwagger() {
  //   const options = {
  //     swaggerDefinition: {
  //       info: {
  //         title: 'REST API',
  //         version: '1.0.0',
  //         description: 'Example docs',
  //       },
  //     },
  //     apis: ['swagger.yaml'],
  //   };

  //   const specs = swaggerJSDoc(options);
  //   this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  // }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializePublicFolder() {
    this.app.use(express.static(path.join(__dirname, './public')));
  }
}

export default App;
