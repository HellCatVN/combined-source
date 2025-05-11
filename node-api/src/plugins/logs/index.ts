import { Router } from "express";
import { LogsController } from "./controller/logs.controller";
import { authMiddleware } from "../auth/middleware/auth.middleware";
import { roleMiddleware } from "../auth/middleware/role.middleware";
import { userRoleManager } from "../users/utils/userRole";

export function RouteCreator(path: string, router: Router) {
  const logsController = new LogsController();
  const userRoles = userRoleManager.getUserRoles

  router.get(
    `${path}`,
    authMiddleware as any,
    roleMiddleware([userRoles.admin]) as any,
    logsController.getLogs
  );
}

export * from "./controller/logs.controller";
export * from "./enum/logs.enum";
export * from "./interface/logs.interface";
export * from "./schema/Logs";
export * from "./service/logs.service";
export * from "./logsContainer";
