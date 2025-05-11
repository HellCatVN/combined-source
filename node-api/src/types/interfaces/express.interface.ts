import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      apiVersion: string;
      language: string;
    }
  }
}

export {};