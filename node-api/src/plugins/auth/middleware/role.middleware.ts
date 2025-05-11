import { NextFunction, Response } from "express";
import { getPermissions } from "../utils/role";
import { RequestWithUser } from "../interface/auth.interface";
import { HttpException } from "@exceptions/HttpException";
import { httpStatusCode } from "@constants/httpStatusCode";

export const getUserPermissionMiddleware = function (req: RequestWithUser) {
  req.permissions = getPermissions(req.user.role);
};

export const roleMiddleware = function (roles: string[]) {
  return function (req: RequestWithUser, _res: Response, next: NextFunction) {
    if (req.user && roles.indexOf(req.user.role) != -1) {
      return next();
    } else {
      next(
        new HttpException(
          httpStatusCode.ClientError.Unauthorized,
          "Permission denied"
        )
      );
    }
  };
};
