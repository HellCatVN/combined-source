import bcrypt from 'bcrypt';
import { Model, Schema, Types, PopulateOptions } from 'mongoose';

import { usersContainer } from '../usersContainer';

// Constants & Exceptions
import { HttpException } from '@exceptions/HttpException';

// Utils & Configs
import { isEmpty } from '@utils';
import { paginate } from '@helpers/pagination';
import { configHash } from '../../auth/utils/config';

// Services
import { LogsService } from '../../logs/service/logs.service';

// Interfaces
import { IUser, IUserDocument, IPopulatedUser } from '../interfaces/users.interface';

// Enums
import { logActions } from '../../logs/enum/logs.enum';
import { RecordDeleteType } from '@enum/RecordDeleteType.enum';

//TODO: migrate this package into bcrypt.js
class UserService {
  public usersCollection = usersContainer.get<Model<IUserDocument>>('UsersCollection');
  public logsService = new LogsService();

  public async findAllUser({ limit, page, query }: { limit: number; page: number; query: object }) {
    const findAllLogsData = await paginate<IUserDocument>(
      {
        model: this.usersCollection,
        filter: query,
        page: page,
        limit: limit,
        select: ['_id', 'username', 'email', 'phone', 'role', 'balance', 'name', 'status'],
        populate: [{ path: 'role', select: 'name' }] // Only populate role name for list view
      }
    );

    return {
      data: findAllLogsData.data,
      pagination: findAllLogsData.pagination,
    };
  }

  public async findUserById(username: string): Promise<IPopulatedUser> {
    if (isEmpty(username)) throw new HttpException(400, 'username is empty');
    const findUser = await this.usersCollection
      .findOne(
        { username },
        { _id: 1, username: 1, email: 1, phone: 1, role: 1, balance: 1, name: 1, status: 1 }
      )
      .populate({
        path: 'role',
        select: 'name description permissions isSystem createdAt updatedAt' // Populate full role details
      })
      .lean()

    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return JSON.parse(JSON.stringify(findUser));
  }

  public async deleteUser(
    username: string,
    userActionId: Schema.Types.ObjectId,
    deleteType: RecordDeleteType
  ): Promise<IUser> {
    const userToDelete = ((await this.usersCollection.findOne({ username }, { _id: 1 }).lean())!);
    if (!userToDelete) throw new HttpException(409, "User doesn't exist");
    let result: any;
    if (deleteType === RecordDeleteType.HARD) {
      result = await this.usersCollection.findOneAndDelete({ username }).lean();
    }
    if (!deleteType || deleteType === RecordDeleteType.SOFT) {
      result = await this.usersCollection.findOneAndUpdate({ username }, { isDeleted: true }, { new: true }).lean();
    }
    if (result) {
      await this.logsService.createLog({
        userActionId: userActionId,
        action: logActions.update,
        record: result._id.toString(),
        schema: this.usersCollection.modelName,
        note: `Admin deleted ${deleteType} user ${username}`,
      });
      return result;
    } else {
      throw new HttpException(500, "Something went wrong")
    }
  }

  public async getUserBootStrapData(userId: string): Promise<{ userInfo: any }> {
    const userInfo = await this.findUserById(userId);
    // TODO : Guard this response please

    return { userInfo };
  }

  public async updateUser(
    username: string,
    userData: Partial<IUser>,
    userActionId: Schema.Types.ObjectId
  ): Promise<IPopulatedUser> {
    if (isEmpty(userData)) throw new HttpException(400, 'User data is empty');

    const user: IUser | null = await this.usersCollection.findOne({ username });

    if (!user) throw new HttpException(409, "User doesn't exist");

    if (userData.email && user.email !== userData.email) {
      const emailExist = await this.usersCollection.findOne({ email: userData.email });
      if (emailExist) throw new HttpException(409, `Email '${userData.email}' already exists`);
    }

    if (userData.phone && user.phone !== userData.phone) {
      const phoneExist = await this.usersCollection.findOne({ phone: userData.phone });
      if (phoneExist) throw new HttpException(409, `Phone '${userData.phone}' already exists`);
    }

    if (userData.password) {
      const salt = bcrypt.genSaltSync(configHash.saltRounds);
      userData.password = bcrypt.hashSync(userData.password, salt);
    }

    const updateUserById = await this.usersCollection
      .findOneAndUpdate({ username }, userData, { new: true })
      .populate({
        path: 'role',
        select: 'name description permissions isSystem createdAt updatedAt' // Consistent population with findById
      })
      .lean<IPopulatedUser>();

    if (!updateUserById) {
      throw new HttpException(500, "Failed to update user");
    }

    await this.logsService.createLog({
      userActionId: userActionId,
      action: logActions.update,
      record: updateUserById._id.toString(),
      schema: this.usersCollection.modelName,
      note: `Admin updated user ${username} info`,
    });

    return updateUserById;
  }
}

export default UserService;
