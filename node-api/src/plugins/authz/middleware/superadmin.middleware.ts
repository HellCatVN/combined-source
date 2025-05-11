import { Response, NextFunction } from 'express';
import { HttpException } from '../../../exceptions/HttpException';
import { IRequestWithUser } from '../interface/authz.interface';
import { httpStatusCode } from '../../../constants/httpStatusCode';

export const superadminMiddleware = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.role;

    if (role !== 'superadmin') {
      throw new HttpException(httpStatusCode.ClientError.Forbidden, 'Access denied. Superadmin role required.');
    }

    next();
  } catch (error) {
    next(error);
  }
};