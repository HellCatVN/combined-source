import { NextFunction, Request, Response } from "express";
import { realIpRequest } from "../utils/getIp";
import AuthService from "../service/auth.service";
import { createToken } from "../utils/createToken";
import { removeClientCookie, setClientCookie } from "../utils/cookies";
import {  IUserInfoResponse, RequestWithUser } from "../interface/auth.interface";
import { getTokenLife, getTokenSecret } from "../utils/config";
import { logger } from "@utils/logger";
import { httpStatusCode } from "../../../constants/httpStatusCode";
import { validatorObject } from "@utils";
import { userInfoValidatorSchema } from "../validator";

class AuthController {
  public authService = new AuthService();

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = realIpRequest(req)
      const { tokenData, refreshTokenData, userInfo } = await this.authService.login({
        username: req.body.username,
        password: req.body.password,
      }, {
        ip: ip,
        userAgent: req.headers['user-agent'] || '',
      });
      setClientCookie(res, {
        token: tokenData.token,
        refreshToken: refreshTokenData.token,
      });

      const response = await validatorObject.successResponse(
        {
          status: httpStatusCode.Success.OK,
          message: "Đăng nhập thành công",
          data: {
            user: userInfo,
          },
        },
        userInfoValidatorSchema
      );

      res.status(httpStatusCode.Success.OK).json(response);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await this.authService.register(req.body);
      const payloadUser: IUserInfoResponse = {
        _id: newUser._id.toString(),
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role.toString()  // Convert ObjectId to string for token
      };
      const token = createToken(payloadUser, getTokenLife(), getTokenSecret());

      const response = {
        status: httpStatusCode.Success.OK,
        message: 'Đăng ký tài khoản thành công',
        data: {
          user: payloadUser,
        },
      };

      return res.status(httpStatusCode.Success.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  public myInfo = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { token } = req.cookies;
      const user = await this.authService.getMyInfo(token);
      const response = {
        status: httpStatusCode.Success.OK,
        message: 'Xác định thông tin thành công',
        data: {
          user: user,
        },
      };

      res.status(httpStatusCode.Success.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const userData: IUserInfoResponse = req.user;
      await this.authService.logout(refreshToken);
      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      removeClientCookie(res);
      res.status(200).json({ data: userData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
