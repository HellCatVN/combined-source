import mongoose from "mongoose";
import { Router } from "express";
import AuthzController from "./controller/authz.controller";
import { Role, IRole } from "./schema/Role";
import { authMiddleware } from "../auth/middleware/auth.middleware";
import { superadminMiddleware } from "./middleware/superadmin.middleware";
import { authzContainer } from "./authzContainer";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import {
  createRoleSchema,
  editRoleAbacSchema,
  addAbacPolicySchema,
  validateAccessSchema
} from "./validator";

export const RoleCollectionCreator = (
  dbInstance: mongoose.Connection
) => {
  return dbInstance.model<IRole>(
    "Role",
    Role.schema,
    "Role"
  );
};

export function RouteCreator(path: string, router: Router) {
  const authzController = authzContainer.get(AuthzController);

  // Role management routes (superadmin only)
  router.post(`${path}roles`, [
    authMiddleware,
    superadminMiddleware,
    validationMiddleware([createRoleSchema]),
    authzController.createRole,
  ] as any);

  router.put(`${path}roles/:roleId/abac`, [
    authMiddleware,
    superadminMiddleware,
    validationMiddleware([editRoleAbacSchema]),
    authzController.editRoleAbac,
  ] as any);

  router.post(`${path}roles/:roleId/policies`, [
    authMiddleware,
    superadminMiddleware,
    validationMiddleware([addAbacPolicySchema]),
    authzController.addAbacPolicy,
  ] as any);

  // Access validation route
  router.post(`${path}validate-access`, [
    authMiddleware,
    validationMiddleware([validateAccessSchema]),
    authzController.validateAccess,
  ] as any);
}

export * from "./interface/authz.interface";
export * from "./controller/authz.controller";
export * from "./service/authz.service";
export * from "./schema/Role";
export * from "./middleware/superadmin.middleware";
export * from "./authzContainer";