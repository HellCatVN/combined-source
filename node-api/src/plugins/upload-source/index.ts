import { Router } from 'express';
import { UploadController } from './controllers/upload.controller';
import { authMiddleware } from '../auth/middleware/auth.middleware';

export function RouteCreator(path: string, router: Router) {
  const uploadController = new UploadController();
  router.post(`${path}`, [
    authMiddleware,
    uploadController.uploadSource,
  ] as any);
}

// Export interfaces for external use
export { FileUpload, VersionControlAPIResponse } from './interfaces/upload.interface';