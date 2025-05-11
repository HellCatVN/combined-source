import { NextFunction, Request, Response } from 'express';
import { UploadSourceRequest } from '../interfaces/upload.interface';
import { HttpException } from '../../../exceptions/HttpException';
import { uploadService } from '../services/upload.service';

export class UploadController {
  /**
   * Upload local changes to remote source
   */
  public uploadSource = async (
    req: UploadSourceRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sourceId } = req.body;

      if (!sourceId) {
        throw new HttpException(400, 'sourceId is required');
      }

      const result = await uploadService.uploadChangedFiles(sourceId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
