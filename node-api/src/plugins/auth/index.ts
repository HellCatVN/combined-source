import mongoose from "mongoose";
import { Router } from "express";
import AuthController from "./controller/auth.controller";
import { refreshTokensSchema } from "./schema/RefreshTokens";
import { authMiddleware } from "./middleware/auth.middleware";
import { IRefreshTokens } from "./interface/refreshToken.interface";

export const RefreshTokenCollectionCreator = (
  dbInstance: mongoose.Connection
) => {
  return dbInstance.model<IRefreshTokens>(
    "RefreshToken",
    refreshTokensSchema,
    "RefreshToken"
  );
};

export function RouteCreator(path: string, router: Router) {
  const authController = new AuthController();

  router.post(`${path}login`, authController.logIn);
  router.post(`${path}register`, authController.register);
  router.get(`${path}my-account`, [
    authMiddleware,
    authController.myInfo,
  ] as any);
  router.post(`${path}logout`, [authMiddleware, authController.logOut] as any);
}

export * from "./constants/adminPermission";
export * from "./controller/auth.controller";
export * from "./interface/auth.interface";
export * from "./interface/refreshToken.interface";
export * from "./middleware/auth.middleware";
export * from "./middleware/role.middleware";
export * from "./schema/RefreshTokens";
export * from "./service/auth.service";
export * from "./utils";
export * from "./authContainer";
