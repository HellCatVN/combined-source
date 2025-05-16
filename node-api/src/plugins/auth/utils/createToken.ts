import { sign } from "jsonwebtoken";
import { IUserInfoResponse, IPopulatedUserInfoResponse, TokenData } from "../interface/auth.interface";

export const createToken = (
    payload: IUserInfoResponse | IPopulatedUserInfoResponse,
    expiresIn: string,
    secretKey: string
): TokenData => {
    // Convert populated role to string if needed
    const tokenPayload: IUserInfoResponse = {
        ...payload,
        role: typeof payload.role === 'string' ? payload.role : payload.role._id.toString()
    };
    
    return {
        expiresIn,
        token: sign(tokenPayload, secretKey, { expiresIn: parseInt(expiresIn) })
    };
}