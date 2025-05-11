import { sign } from "jsonwebtoken";
import { IUserInfoResponse, TokenData } from "../interface/auth.interface";

export const createToken = (payload: IUserInfoResponse, expiresIn: string, secretKey: string): TokenData => {
    return { expiresIn, token: sign(payload, secretKey, { expiresIn: parseInt(expiresIn) }) };
}