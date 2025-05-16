import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../../../exceptions/HttpException';
import { IUserDocument } from '../../users/interfaces/users.interface';
import { ResolvedPermission } from '../interface/authz.interface';
import { authzEndpointConfigSchema } from '../schema/AuthzEndpointConfig';
import mongoose from 'mongoose';
import { authzContainer } from '../authzContainer';
import { AuthzService } from '../interface/authz.interface';

const EndpointConfigModel = mongoose.model('EndpointConfig', authzEndpointConfigSchema);
const authzService = authzContainer.get<AuthzService>('AuthzService');

export interface RequestWithUser extends Request {
  user: IUserDocument;
}

/**
 * Check if user has required permission for a resource
 */
export const checkPermission = (resource?: string, action?: string) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const endpoint = await EndpointConfigModel.findOne({
        path: req.path,
        method: req.method,
        isActive: true
      });

      let resolvedPermission: ResolvedPermission;

      if (endpoint) {
        resolvedPermission = {
          resource: endpoint.resource,
          action: endpoint.action,
          source: 'database'
        };
      } else if (resource && action) {
        resolvedPermission = {
          resource,
          action,
          source: 'params'
        };
      } else {
        return next();
      }

      const hasPermission = await authzService.checkPermission({
        user: req.user,
        resource: resolvedPermission.resource,
        action: resolvedPermission.action
      });

      if (!hasPermission) {
        throw new HttpException(
          403,
          `Permission denied for ${resolvedPermission.action} on ${resolvedPermission.resource}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has any of the required permissions
 */
export const checkAnyPermission = (permissions: Array<{ resource?: string; action?: string }>) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const endpoint = await EndpointConfigModel.findOne({
        path: req.path,
        method: req.method,
        isActive: true
      });

      if (endpoint) {
        const hasPermission = await authzService.checkPermission({
          user: req.user,
          resource: endpoint.resource,
          action: endpoint.action
        });

        if (hasPermission) {
          return next();
        }
      }

      for (const { resource, action } of permissions) {
        if (resource && action) {
          const hasPermission = await authzService.checkPermission({
            user: req.user,
            resource,
            action
          });

          if (hasPermission) {
            return next();
          }
        }
      }

      if (permissions.length === 0 && !endpoint) {
        return next();
      }

      throw new HttpException(403, 'Permission denied - requires any of specified permissions');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has all required permissions
 */
export const checkAllPermissions = (permissions: Array<{ resource?: string; action?: string }>) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const endpoint = await EndpointConfigModel.findOne({
        path: req.path,
        method: req.method,
        isActive: true
      });

      if (endpoint) {
        const hasPermission = await authzService.checkPermission({
          user: req.user,
          resource: endpoint.resource,
          action: endpoint.action
        });

        if (!hasPermission) {
          throw new HttpException(403, `Permission denied for ${endpoint.action} on ${endpoint.resource}`);
        }
      }

      for (const { resource, action } of permissions) {
        if (resource && action) {
          const hasPermission = await authzService.checkPermission({
            user: req.user,
            resource,
            action
          });

          if (!hasPermission) {
            throw new HttpException(403, `Permission denied for ${action} on ${resource}`);
          }
        }
      }

      if (!endpoint && permissions.every(p => !p.resource || !p.action)) {
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware that automatically checks permissions based on endpoint configuration
 */
export const dynamicPermissionCheck = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const endpoint = await EndpointConfigModel.findOne({
      path: req.path,
      method: req.method,
      isActive: true
    });

    if (!endpoint) {
      return next();
    }

    const hasPermission = await authzService.checkPermission({
      user: req.user,
      resource: endpoint.resource,
      action: endpoint.action
    });

    if (!hasPermission) {
      throw new HttpException(
        403,
        `Permission denied - requires ${endpoint.action} permission on ${endpoint.resource}`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has required permission with path pattern matching
 */
export const checkEndpointPermission = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const endpoints = await EndpointConfigModel.find({
      method: req.method,
      isActive: true
    });

    const matchingEndpoint = endpoints.find(endpoint => {
      const pattern = endpoint.path
        .replace(/:[^\s/]+/g, '[^/]+')
        .replace(/\*/g, '.*');
      
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(req.path);
    });

    if (!matchingEndpoint) {
      return next();
    }

    const hasPermission = await authzService.checkPermission({
      user: req.user,
      resource: matchingEndpoint.resource,
      action: matchingEndpoint.action
    });

    if (!hasPermission) {
      throw new HttpException(
        403,
        `Permission denied - requires ${matchingEndpoint.action} permission on ${matchingEndpoint.resource}`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};