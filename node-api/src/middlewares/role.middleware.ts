import { NextFunction, Response } from 'express';

import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { httpStatusCode } from '@kiteszonevn/common-modules';

export const roleMiddleware = function (roles: string[]) {
  return function (req: RequestWithUser, _res: Response, next: NextFunction) {
    if (req.user && roles.indexOf(req.user.role) != -1) {
      return next();
    } else {
      next(new HttpException(httpStatusCode.ClientError.Unauthorized, 'Permission denied'));
    }
  };
};
