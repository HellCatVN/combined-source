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
const EndpointConfigModel = authzContainer.get<Model<IEndpointConfig>>("AuthzEndpointConfigCollection");

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

const getEndpointConfig = async (path: string, method: string): Promise<IEndpointConfig | null> => {
  return await EndpointConfigModel.findOne({
    path,
    method: method.toLowerCase(),
  });
};

const checkSinglePermission = async (
  user: IUserInfoResponse,
  config: IEndpointConfig | null,
  resource?: string,
  action?: string
): Promise<boolean> => {
  return await authzService.checkPermission({
    user: assertUserForPermissionCheck(user),
    resource: config?.resource || resource,
    action: config?.action || action,
  });
};

// Middleware functions
export const authzMiddleware = (resource?: string, action?: string) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const config = await getEndpointConfig(req.path, req.method);
      const hasPermission = await checkSinglePermission(req.user, config, resource, action);
      if (!hasPermission) {
        return next(new HttpException(httpStatusCode.ClientError.Forbidden, "Access denied"));
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authzAnyMiddleware = (permissions: PermissionConfig[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const config = await getEndpointConfig(req.path, req.method);
      
      const checkResults = await Promise.all(
        permissions.map(permission =>
          checkSinglePermission(req.user, config, permission.resource, permission.action)
        )
      );

      if (!checkResults.some(result => result === true)) {
        return next(new HttpException(httpStatusCode.ClientError.Forbidden, "Access denied"));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authzMultiMiddleware = (permissions: PermissionConfig[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const config = await getEndpointConfig(req.path, req.method);
      
      const checkResults = await Promise.all(
        permissions.map(permission =>
          checkSinglePermission(req.user, config, permission.resource, permission.action)
        )
      );

      if (!checkResults.every(result => result === true)) {
        return next(new HttpException(httpStatusCode.ClientError.Forbidden, "Access denied"));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
