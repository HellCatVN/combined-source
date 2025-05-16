import { Schema } from 'mongoose';

// Constants & Exceptions
import { HttpException } from '@exceptions/HttpException';
import { httpStatusCode } from '@constants/httpStatusCode';

// Interfaces
import { ICustomRelatedModels } from '../interfaces/users.interface';

// Enums
import { userGender, userStatus } from '../enum/user.enum';

export const SchemaCreator = <Type>(customUserSchema: any = {}, customRelatedModels: ICustomRelatedModels = {
  relatedModels: [],
}
) => {
  const originUser = {
    status: {
      type: String,
      default: userStatus.active,
      enum: userStatus,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'AuthzRoles',
      required: true,
      default: undefined,
    },
    name: {
      type: String,
      require: true,
    },
    username: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    birthDate: {
      type: Date,
      require: true,
    },
    gender: {
      type: String,
      enum: userGender,
      require: true,
    },
    phone: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    isDeleted: {
      type: Boolean,
      require: true,
      default: false,
    }
  };
  const finalUserSchema = {
    ...originUser,
    ...customUserSchema,
  };
  const customizedUserSchema = new Schema<Type>(finalUserSchema, {
    timestamps: true,
  });

  /* Start - Hook triggered when delete user */
  customizedUserSchema.pre(['findOneAndDelete', 'deleteOne'], async function (next) {
    if (customRelatedModels.relatedModels.length) {
      const user = await this.model.findOne(this.getQuery());
      if (user) {
        const deletePromises = customRelatedModels.relatedModels.map(model => model.deleteMany({ userId: user._id }));
        await Promise.all(deletePromises);
      } else {
        next(new HttpException(httpStatusCode.ClientError.BadRequest, 'User not found'));
      }
    }
    next();
  });

  /* End - Hook triggered when delete user */

  return customizedUserSchema;

};
