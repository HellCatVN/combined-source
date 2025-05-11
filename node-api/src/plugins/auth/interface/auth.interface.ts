import { Request } from 'express';
import { IUserPermission } from '../../users/interfaces/users.interface';

export interface DataStoredInToken {
  _id: string;
}

export interface TokenData {
  token: string;
  expiresIn: string | number;
}

export interface RequestWithUser extends Request {
  user: IUserInfoResponse;
  permissions: IUserPermission[];
  metadata: any
}

export interface IUserInfoResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  username: string;
}

export interface IUserRequestIdentity {
  userAgent: string;
  ip: string;
}

export interface IPayloadRegister {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface IPayloadLogin {
  username: string;
  password: string;
}

export interface IAuthResponse {
  user: IUserInfoResponse;
  accessToken: string;
}

export interface ITokenCheck {
  token: string;
  refreshToken: string;
}

export interface IRefreshTokenCheck {
  token: string;
  refreshToken: string;
  payload: IUserInfoResponse;
}
