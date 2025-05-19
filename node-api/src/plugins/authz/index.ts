import mongoose from "mongoose";
import { Router } from "express";
import { authMiddleware } from "../auth/middleware/auth.middleware";
import { authzMiddleware } from "./middleware/authz.middleware";
import { AuthzController } from "./controller/authz.controller";
import { Role, IResource, IEndpointConfig } from "./interface/authz.interface";
import { authzRolesSchema } from "./schema/AuthzRoles";
import { authzResourcesSchema } from "./schema/AuthzResources";
import { authzEndpointConfigSchema } from "./schema/AuthzEndpointConfig";

export function RouteCreator(path: string, router: Router) {
  const authzController = new AuthzController();

  router.get(
    `${path}permissions`,
    authMiddleware as any,
    authzMiddleware('permissions', 'read') as any,
    authzController.getPermissions
  );

  router.get(
    `${path}roles`,
    authMiddleware as any,
    authzMiddleware('roles', 'read') as any,
    authzController.getRoles
  );

  router.get(
    `${path}roles/:id`,
    authMiddleware as any,
    authzMiddleware('roles', 'read') as any,
    authzController.getRoleById
  );

  router.post(
    `${path}roles`,
    authMiddleware as any,
    authzMiddleware('roles', 'create') as any,
    authzController.createRole
  );

  router.put(
    `${path}roles/:roleId`,
    authMiddleware as any,
    authzMiddleware('roles', 'update') as any,
    authzController.updateRole
  );

  router.delete(
    `${path}roles/:roleId`,
    authMiddleware as any,
    authzMiddleware('roles', 'delete') as any,
    authzController.deleteRole
  );

  router.get(
    `${path}resources`,
    authMiddleware as any,
    authzMiddleware('resources', 'read') as any,
    authzController.getResources
  );

  router.get(
    `${path}resources/:id`,
    authMiddleware as any,
    authzMiddleware('resources', 'read') as any,
    authzController.getResourceById
  );

  router.post(
    `${path}resources`,
    authMiddleware as any,
    authzMiddleware('resources', 'create') as any,
    authzController.createResource
  );

  router.put(
    `${path}resources/:id`,
    authMiddleware as any,
    authzMiddleware('resources', 'update') as any,
    authzController.updateResource
  );

  router.delete(
    `${path}resources/:id`,
    authMiddleware as any,
    authzMiddleware('resources', 'delete') as any,
    authzController.deleteResource
  );

  router.get(
    `${path}endpoints`,
    authMiddleware as any,
    authzMiddleware('endpoints', 'read') as any,
    authzController.getEndpointConfigs
  );

  router.get(
    `${path}endpoints/:id`,
    authMiddleware as any,
    authzMiddleware('endpoints', 'read') as any,
    authzController.getEndpointConfigById
  );

  router.post(
    `${path}endpoints`,
    authMiddleware as any,
    authzMiddleware('endpoints', 'create') as any,
    authzController.createEndpointConfig
  );

  router.put(
    `${path}endpoints/:id`,
    authMiddleware as any,
    authzMiddleware('endpoints', 'update') as any,
    authzController.updateEndpointConfig
  );

  router.delete(
    `${path}endpoints/:id`,
    authMiddleware as any,
    authzMiddleware('endpoints', 'delete') as any,
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