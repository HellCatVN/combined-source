import { Model } from "mongoose";
import { JwtPayload, verify } from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { authContainer } from "../authContainer";
import { createToken } from "../utils/createToken";
import { setClientCookie } from "../utils/cookies";
import {
  getRefreshTokenLife,
  getRefreshTokenSecret,
  getTokenLife,
  getTokenSecret,
} from "../utils/config";
import {
  IRefreshTokenCheck,
  ITokenCheck,
  IPopulatedUserInfoResponse,
  IUserWithPassword,
  RequestWithUser,
  TokenData,
} from "../interface/auth.interface";
import { logger } from "@utils/logger";
import { HttpException } from "@exceptions/HttpException";
import { httpStatusCode } from "@constants/httpStatusCode";
import { IRefreshTokens } from "../interface/refreshToken.interface";
import { usersContainer } from "../../users/usersContainer";
import { userStatus } from "../../users";

const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = "";
    if (req.cookies["token"]) {
      token = req.cookies["token"];
    } else if (req && req.header("Authorization")) {
      token = req.header("Authorization")!.split("Bearer ")[1];
    }
    const refreshToken = req.cookies["refreshToken"];

    if (token) {
      const result = await tokenCheck(token, refreshToken, req);
      if (result === false) {
        next(
          new HttpException(
            httpStatusCode.ClientError.Unauthorized,
            "User session is ended due to token is expired",
            true
          )
        );
      } else {
        if (result !== true && !(result instanceof Boolean)) {
          setClientCookie(res, { token, refreshToken });
        }
        next();
      }
    } else {
      next(
        new HttpException(
          httpStatusCode.ClientError.Unauthorized,
          "Authentication token missing"
        )
      );
    }
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      const result = await checkRefreshToken(req.cookies["refreshToken"]);
      if (result === false) {
        return next(
          new HttpException(
            httpStatusCode.ClientError.Unauthorized,
            "User session is ended due to token is expired",
            true
          )
        );
      }
      req.user = result.payload;
      return next();
    }

    if (error.name === "JsonWebTokenError") {
      return next(
        new HttpException(
          httpStatusCode.ClientError.Unauthorized,
          "Invalid authentication token",
          true
        )
      );
    }

    return next(
      new HttpException(
        httpStatusCode.ClientError.Unauthorized,
        "Authentication failed",
        true
      )
    );
  }
};

async function checkRefreshToken(
  refreshToken: string
): Promise<false | IRefreshTokenCheck> {
  try {
    var rfToken: TokenData;
    const refreshTokensCollection = authContainer.get<Model<IRefreshTokens>>(
      "RefreshTokensCollection"
    );
    const usersCollection = usersContainer.get<Model<any>>('UsersCollection');

    let refreshTokenInfo = await refreshTokensCollection.findOne({
      token: refreshToken,
    });
    if (!refreshTokenInfo) {
      return false;
    }
    try {
      const decodedToken = verify(refreshToken, getRefreshTokenSecret()) as JwtPayload
      var decodedUser = {
        _id: decodedToken._id,
        role: decodedToken.role,
        name: decodedToken.name,
        email: decodedToken.email,
        username: decodedToken.username,
        iat: decodedToken.iat!,
        exp: decodedToken.exp!,
      }
    } catch (error) {
      await refreshTokenInfo.deleteOne();
      return false;
    }

    const userDoc = await usersCollection
      .findOne({
        username: decodedUser.username,
        isDeleted: {
          $ne: true
        }
      })
      .select(['username', 'name', 'email', 'role', 'password', '_id', 'status'])
      .populate('role')
      .lean<IUserWithPassword>();

    if (!userDoc) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Tài khoản hoặc mật khẩu không chính xác');
    }

    if (userDoc.status === userStatus.lock) {
      throw new HttpException(httpStatusCode.ClientError.Forbidden, 'Tài khoản của bạn đang tạm khoá');
    }

    if (!userDoc) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Tài khoản hoặc mật khẩu không chính xác');
    }

    const payload: IPopulatedUserInfoResponse = {
      name: userDoc.name,
      email: userDoc.email,
      username: userDoc.username,
      role: userDoc.role,
      _id: userDoc._id.toString(),
    };

    if (
      (Date.now() / 1000 - decodedUser.iat) /
        (decodedUser.exp - decodedUser.iat) >=
      0.5
    ) {
      rfToken = createToken(
        payload,
        getRefreshTokenLife(),
        getRefreshTokenSecret()
      );
      refreshTokenInfo.token = rfToken.token;
      await refreshTokenInfo.save();
    }
    var token = createToken(payload, getTokenLife(), getTokenSecret());
    return { token: token.token, refreshToken, payload };
  } catch (error: any) {
    logger.error(error.stack);
    return false;
  }
}

async function tokenCheck(
  token: string,
  refreshToken: string,
  req: RequestWithUser
): Promise<Boolean | ITokenCheck> {
  if (!token || !refreshToken) {
    return false;
  }
  try {
    var decodedToken = verify(token, getTokenSecret()) as JwtPayload
    const user = {
      _id: decodedToken._id,
      role: decodedToken.role,
      name: decodedToken.name,
      email: decodedToken.email,
      username: decodedToken.username,
    }
    req.user = user;
    return true;
  } catch (error: any) {
    if (error.name == "TokenExpiredError") {
      const result = await checkRefreshToken(refreshToken);
      if (result === false) {
        return false;
      }
      const userData = result.payload;
      req.user = userData;
      return {
        token: result.token,
        refreshToken: result.refreshToken,
      };
    } else {
      return false;
    }
  }
}

const nonRequireLoginMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = "";
    if (req.cookies["token"]) {
      token = req.cookies["token"];
    } else if (req && req.header("Authorization")) {
      token = req.header("Authorization")!.split("Bearer ")[1];
    }
    const refreshToken = req.cookies["refreshToken"];

    if (token) {
      const result = await tokenCheck(token, refreshToken, req);
      if (result === false) {
        next();
      } else {
        if (result !== true && !(result instanceof Boolean)) {
          setClientCookie(res, { token, refreshToken });
        }
        next();
      }
    } else {
      next();
    }
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      const result = await checkRefreshToken(req.cookies["refreshToken"]);
      if (result === false) {
        return next();
      }
      req.user = result.payload;
      return next();
    }

    if (error.name === "JsonWebTokenError") {
      return next();
    }

    return next();
  }
};

export { authMiddleware, nonRequireLoginMiddleware };
