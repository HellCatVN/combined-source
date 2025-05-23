import { Router } from "express";
import { authMiddleware } from "../auth/middleware/auth.middleware";
import { authzMiddleware } from "../authz/middleware/authz.middleware";
import { LogsController } from "./controller/logs.controller";

export function RouteCreator(path: string, router: Router) {
  const logsController = new LogsController();
  
  router.get(
    `${path}`,
    authMiddleware as any,
    authzMiddleware([{ resource: 'logs', action: 'read' }]) as any,
    logsController.getLogs
  );
}

// Export all internal modules
export * from "./controller/logs.controller";
export * from "./enum/logs.enum";
export * from "./interface/logs.interface";
export * from "./schema/Logs";
export * from "./service/logs.service";
export * from "./logsContainer";
