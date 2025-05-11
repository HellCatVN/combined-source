import { Schema } from "mongoose";
import { IRefreshTokens } from "../../auth/interface/refreshToken.interface";

export const refreshTokensSchema = new Schema<IRefreshTokens>(
  {
    userId: { type: String },
    token: { type: String, unique: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

