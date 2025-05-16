import mongoose from "mongoose";
import { Router } from "express";
import { authMiddleware } from "../auth/middleware/auth.middleware";
import { roleMiddleware } from "../auth/middleware/role.middleware";
import { userRoleManager } from "../users/utils/userRole";
import { AuthzController } from "./controller/authz.controller";
import { Role, IResource, IEndpointConfig } from "./interface/authz.interface";
import { authzRolesSchema } from "./schema/AuthzRoles";
import { authzResourcesSchema } from "./schema/AuthzResources";
import { authzEndpointConfigSchema } from "./schema/AuthzEndpointConfig";

export function RouteCreator(path: string, router: Router) {
  const authzController = new AuthzController();
  const userRoles = userRoleManager.getUserRoles;

  router.get(
    `${path}permissions`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.getPermissions
  );

  router.get(
    `${path}roles`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.getRoles
  );

  router.post(
    `${path}roles`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.createRole
  );

  router.put(
    `${path}roles/:roleId`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.updateRole
  );

  router.delete(
    `${path}roles/:roleId`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.deleteRole
  );

  router.get(
    `${path}resources`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.getResources
  );

  router.post(
    `${path}resources`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.createResource
  );

  router.put(
    `${path}resources/:id`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.updateResource
  );

  router.delete(
    `${path}resources/:id`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.deleteResource
  );

  router.get(
    `${path}endpoints`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.getEndpointConfigs
  );

  router.post(
    `${path}endpoints`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.createEndpointConfig
  );

  router.put(
    `${path}endpoints/:id`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.updateEndpointConfig
  );

  router.delete(
    `${path}endpoints/:id`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    authzController.deleteEndpointConfig
  );
}

// MongoDB model creators
export const AuthzRolesCollectionCreator = (dbInstance: mongoose.Connection) => {
  return dbInstance.model<Role>('AuthzRoles', authzRolesSchema);
};

export const AuthzResourcesCollectionCreator = (dbInstance: mongoose.Connection) => {
  return dbInstance.model<IResource>('AuthzResources', authzResourcesSchema);
};

export const AuthzEndpointConfigCollectionCreator = (dbInstance: mongoose.Connection) => {
  return dbInstance.model<IEndpointConfig>('AuthzEndpointConfig', authzEndpointConfigSchema);
};

// Export all internal modules
export * from "./interface/authz.interface";
export * from "./controller/authz.controller";
export * from "./middleware/authz.middleware";
export * from "./service/authz.service";
export * from "./schema/AuthzRoles";
export * from "./schema/AuthzResources";
export * from "./schema/AuthzEndpointConfig";