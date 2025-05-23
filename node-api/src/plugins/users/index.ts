import { Router } from "express";
import {
  ICustomerValidatorUserRules,
} from "./interfaces/users.interface";
import UsersController from "./controller/user.controller";
import { authMiddleware } from "../auth/middleware/auth.middleware";
import { validateDataBySchemaMiddleware } from "@middlewares/validation.middleware";
import { originUpdateUserPayloadRules } from "./rules/payload.rule";
import { authzMiddleware } from "../authz/middleware/authz.middleware";

export function RouteCreator(
  path: string,
  router: Router,
  customValidatorRules?: ICustomerValidatorUserRules,
) {
  const userController = new UsersController();

  // List users
  router.get(
    `${path}`,
    authMiddleware as any,
    authzMiddleware([{ resource: 'users', action: 'list' }]),
    userController.getUsers
  );

  // Bootstrap data (no permission required)
  router.get(
    `${path}/bootstrap`,
    authMiddleware as any,
    userController.getUserBootStrapData as any
  );

  // Get user by ID
  router.get(
    `${path}/:username`,
    authMiddleware as any,
    authzMiddleware([{ resource: 'users', action: 'read' }]),
    userController.getUserById as any
  );

  // Delete user
  router.delete(
    `${path}/:username`,
    authMiddleware as any,
    authzMiddleware([{ resource: 'users', action: 'delete' }]),
    userController.deleteUser as any
  );

  // Update user
  router.patch(
    `${path}/:username`,
    authMiddleware as any,
    authzMiddleware([{ resource: 'users', action: 'update' }]),
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
