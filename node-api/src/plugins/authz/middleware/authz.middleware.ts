import { Response, NextFunction } from "express";
import { authzContainer } from "../authzContainer";
import { Model } from "mongoose";
import { httpStatusCode } from "@constants/httpStatusCode";
import { HttpException } from "@exceptions/HttpException";
import AuthzService from "../service/authz.service";
import {
  IEndpointConfig,
  CheckPermissionParams,
} from "../interface/authz.interface";
import {
  RequestWithUser,
  IUserInfoResponse,
} from "@plugins/auth/interface/auth.interface";

const authzService = new AuthzService();

interface PermissionConfig {
  resource: string;
  action: string;
}

// Helper functions
const assertUserForPermissionCheck = (
  user: IUserInfoResponse
): CheckPermissionParams["user"] => {
  return user as unknown as CheckPermissionParams["user"];
};

const checkMultiplePermissions = async (
  user: IUserInfoResponse,
  permissions: PermissionConfig[],
  type: 'any' | 'all' = 'all'
): Promise<boolean> => {
  const checkResults = await Promise.all(
    permissions.map(({ resource, action }) =>
      authzService.checkPermission({
        user: assertUserForPermissionCheck(user),
        resource,
        action,
      })
    )
  );

  return type === 'any'
    ? checkResults.some(result => result === true)
    : checkResults.every(result => result === true);
};

const checkSinglePermission = async (
  user: IUserInfoResponse,
  permission: PermissionConfig
): Promise<boolean> => {
  return await authzService.checkPermission({
    user: assertUserForPermissionCheck(user),
    resource: permission.resource,
    action: permission.action,
  });
};

// Unified authorization middleware
export const authzMiddleware = (permissions: PermissionConfig[] = [], authType: 'any' | 'all' = 'all') => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (permissions.length === 0) {
        return next();
      }

      const hasPermission = await checkMultiplePermissions(req.user, permissions, authType);

      if (!hasPermission) {
        return next(new HttpException(httpStatusCode.ClientError.Forbidden, "Access denied"));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
