import mongoose from "mongoose";
import { Router } from "express";
import { roleMiddleware } from "../auth/middleware/role.middleware";
import {
  ICustomerValidatorUserRules,
} from "./interfaces/users.interface";
import UsersController from "./controller/user.controller";
import { authMiddleware } from "../auth/middleware/auth.middleware";
import { validateDataBySchemaMiddleware } from "@middlewares/validation.middleware";
import { originUpdateUserPayloadRules } from "./rules/payload.rule";
import { userRoleManager } from "./utils/userRole";

export function RouteCreator(
  path: string,
  router: Router,
  customValidatorRules?: ICustomerValidatorUserRules,
) {
  const userController = new UsersController();
  const userRoles = userRoleManager.getUserRoles

  router.get(
    `${path}`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    userController.getUsers
  );
  router.get(
    `${path}/bootstrap`,
    authMiddleware as any,
    userController.getUserBootStrapData as any
  );
  router.get(
    `${path}/:username`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    userController.getUserById as any
  );
  router.delete(
    `${path}/:username`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    userController.deleteUser as any
  );

  router.patch(
    `${path}/:username`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    validateDataBySchemaMiddleware(
      customValidatorRules
        ? customValidatorRules.customUserPayloadRules
        : originUpdateUserPayloadRules
    ) as any,
    userController.updateUser as any
  );
}

export * from "./constants/userPermissions";
export * from "./controller/user.controller";
export * from "./enum/user.enum";
export * from "./interfaces/users.interface";
export * from "./rules/payload.rule";
export * from "./rules/user.rule";
export * from "./schema/Users";
export * from "./service/user.service";
export * from "./usersContainer";
