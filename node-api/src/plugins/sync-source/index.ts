import { Router } from 'express';
import SourceController from './controllers/source.controller';
import { authMiddleware } from '../auth/middleware/auth.middleware';

export function RouteCreator(path: string, router: Router) {
  const sourceController = new SourceController();
  
  // Get all sources with their versions
  router.get(`${path}sources`, [
    authMiddleware,
    sourceController.getSources,
  ] as any);

  // Update source files from version control
  router.post(`${path}update-source`, [
    authMiddleware,
    sourceController.updateSource,
  ] as any);
}

// Export components for external use
export { SourceResponse, Source, SourceFile } from './interfaces/source.interface';
export { FileVersion, FileContent } from './interfaces/sync.interface';
