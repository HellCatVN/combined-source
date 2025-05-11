import { Router } from 'express';

// Extend Express Request interface to include our custom properties
declare global {
  namespace Express {
    interface Request {
      apiVersion: string;
      language: string;
    }
  }
}

export interface Routes {
  path?: string;
  router: Router;
}

export interface VersionedRouteConfig {
  version: string;
  language: string;
  path: string;
}
