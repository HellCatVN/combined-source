import { config } from 'dotenv';
config();

export const CREDENTIALS = process.env.CREDENTIALS === 'true';

const ENV = {
  get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  },
  get PORT(): string | number {
    return process.env.PORT || 3000;
  },

  get SITE_DOMAIN(): string {
    return process.env.SITE_DOMAIN || 'http://localhost:3001/, http://localhost:3002/';
  },

  get PATH_UPLOAD_BUNNY(): string {
    if (process.env.NODE_ENV === 'development') {
      return 'test/imidman';
    }
    return 'prod/imidman';
  },

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  TOKEN_LIFE: process.env.TOKEN_LIFE,
  REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE,
  LOG_FORMAT: process.env.LOG_FORMAT,
  LOG_DIR: process.env.LOG_DIR,
  ORIGIN: process.env.ORIGIN,
};

export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  TOKEN_LIFE,
  REFRESH_TOKEN_LIFE,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  SITE_DOMAIN,
} = ENV;
