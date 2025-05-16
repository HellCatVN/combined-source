import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { authContainer } from '../authContainer';
import { httpStatusCode } from '@constants/httpStatusCode';
import { HttpException } from '@exceptions/HttpException';
import { configHash, getRefreshTokenLife, getRefreshTokenSecret, getTokenLife, getTokenSecret } from '../utils/config';
import { IUser } from '../../users/interfaces/users.interface';
import { IRefreshTokens } from '../../auth/interface/refreshToken.interface';
import { usersContainer } from '../../users';
import { IPayloadLogin, IPayloadRegister, IUserInfoResponse, IPopulatedUserInfoResponse, IUserRequestIdentity, TokenData, IUserWithPassword } from '../interface/auth.interface';
import { userStatus } from "../../users/enum/user.enum";

class AuthService {
  public usersCollection = usersContainer.get<Model<IUserWithPassword>>('UsersCollection');
  public refreshTokensCollection = authContainer.get<Model<IRefreshTokens>>('RefreshTokensCollection');

  public async login(
    payload: IPayloadLogin,
    userRequestIdentify: IUserRequestIdentity
  ): Promise<{
    userInfo: IPopulatedUserInfoResponse;
    tokenData: TokenData;
    refreshTokenData: TokenData;
  }> {
    let statusCode = httpStatusCode.ClientError.BadRequest;

    if (!payload.username || !payload.password) {
      throw new HttpException(statusCode, 'Hãy điền đầy đủ thông tin');
    }

    const user = await this.usersCollection
      .findOne({
        username: payload.username,
        isDeleted: {
          $ne : true
        }
      })
      .select(['username', 'name', 'email', 'role', 'password', '_id', 'status'])
      .populate('role')
      .lean<IUserWithPassword>();

    if (!user || !bcrypt.compareSync(payload.password, user.password)) {
      throw new HttpException(statusCode, 'Tài khoản hoặc mật khẩu không chính xác');
    }

    if(user.status === userStatus.lock) {
      throw new HttpException(httpStatusCode.ClientError.Forbidden, 'Tài khoản của bạn đang tạm khoá');
    }

    const userInfo: IPopulatedUserInfoResponse = {
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const tokenData = this.createToken(userInfo, getTokenLife(), getTokenSecret());
    const refreshTokenData = this.createToken(userInfo, getRefreshTokenLife(), getRefreshTokenSecret());
    await this.saveNewRefreshToken(user._id, userRequestIdentify, refreshTokenData.token);

    return { userInfo, tokenData, refreshTokenData };
  }

  public async register(payload: IPayloadRegister): Promise<IUser> {
    const user = await this.usersCollection.findOne({
      $or: [{ username: payload.username }, { email: payload.email }, { phone: payload.phone }],
    });
    if (user) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Tên đăng nhập, email hoặc số điện thoại đã sử dụng!');
    }
    // Encrypting password
    const salt = bcrypt.genSaltSync(configHash.saltRounds);
    const hashedPassword = bcrypt.hashSync(payload.password, salt);
    const newUser = await this.usersCollection.create({
      ...payload,
      password: hashedPassword,
    });
    return newUser;
  }

  public async getMyInfo(token: string): Promise<IUserInfoResponse> {
    if (!token) {
      throw new HttpException(httpStatusCode.ClientError.Unauthorized, 'Unauthorized');
    }
    try {
      const decodedToken = verify(token, getTokenSecret()) as JwtPayload
      return {
        _id: decodedToken._id,
        role: decodedToken.role,
        name: decodedToken.name,
        email: decodedToken.email,
        username: decodedToken.username,
      }
    } catch (error) {
      throw new HttpException(httpStatusCode.ClientError.Unauthorized, 'Unauthorized');
    }
  }

  public async getNewToken(userInfo: IUserInfoResponse) {
    try {
      const tokenData = this.createToken(userInfo, getTokenLife(), getTokenSecret());
      return { tokenData };
    } catch (error) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Bad request');
    }
  }

  public async getNewRefreshToken(userId: string, userRequestId: IUserRequestIdentity) {
    await this.refreshTokensCollection.findOneAndUpdate(
      {
        userId: userId,
        userAgent: userRequestId.userAgent,
        ip: userRequestId.ip,
      },
      {
        userId: userId,
        token: '',
        userAgent: userRequestId.userAgent,
        ip: userRequestId.ip,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  public createToken(payload: IUserInfoResponse | IPopulatedUserInfoResponse, expiresIn: string, secretKey: string): TokenData {
    return { expiresIn, token: sign(payload, secretKey, { expiresIn: parseInt(expiresIn) }) };
  }

  public async saveNewRefreshToken(userId: string, userRequestIdentify: IUserRequestIdentity, refreshToken: string) {
    await this.refreshTokensCollection.findOneAndUpdate(
      {
        userId: userId,
        userAgent: userRequestIdentify.userAgent,
        ip: userRequestIdentify.ip,
      },
      {
        userId: userId,
        token: refreshToken,
        userAgent: userRequestIdentify.userAgent,
        ip: userRequestIdentify.ip,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  public async logout(refreshToken: string) {
    await this.refreshTokensCollection.deleteOne({
      token: refreshToken,
    });
  }
}

export default AuthService;
