import { httpStatusCode } from '@kiteszonevn/common-modules';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { HttpException } from '@exceptions/HttpException';
import { TypeUpload } from '@enum/upload.enum';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const uploadMiddleware = function (type: TypeUpload, name: string | string[], maxCount?: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let uploader = null;
      switch (type) {
        case TypeUpload.none:
          uploader = upload.none();
          break;
        case TypeUpload.single:
          if (typeof name === 'string') {
            uploader = upload.single(name);
          }
          break;
        case TypeUpload.array:
          if (typeof name === 'string') {
            uploader = upload.array(name, maxCount || 99);
          }
          break;
        case TypeUpload.fields:
          if (Array.isArray(name)) {
            uploader = upload.fields(
              name.map(x => ({
                name: x,
                maxCount: maxCount || 99,
              }))
            );
          }
          break;
        default:
          break;
      }
      if (uploader == null) {
        return next();
      } else {
        return uploader(req, res, function (err: unknown) {
          if (err) {
            if (err instanceof multer.MulterError) {
              // A Multer error occurred when uploading.
              next(new HttpException(httpStatusCode.ClientError.BadRequest, err.message, false))
            } else {
              // Other unexpected errors
              next(new HttpException(httpStatusCode.ServerError.InternalServerError, "Something went wrong in MilterMiddleware", false))
            }
          }
          return next();
        });
      }
    } catch (error) {
      next(error);
    }
  };
};
