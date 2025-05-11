import { Document } from 'mongoose';

export interface IRefreshTokens extends Document {
    userId: string;
    token: string;
    ip: string,
    userAgent: string
}

export interface IRefreshTokensDocument extends IRefreshTokens , Document {}