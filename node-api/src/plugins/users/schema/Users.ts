import { Schema } from 'mongoose';

// Constants & Exceptions
import { HttpException } from '@exceptions/HttpException';
import { httpStatusCode } from '@constants/httpStatusCode';

// Interfaces
import { ICustomRelatedModels } from '../interfaces/users.interface';

// Enums
import { userGender, userStatus } from '../enum/user.enum';

// Define supported authentication providers
export enum AuthProvider {
  GOOGLE = 'google',
  DISCORD = 'discord'
}

export const SchemaCreator = <Type>(customUserSchema: any = {}, customRelatedModels: ICustomRelatedModels = {
  relatedModels: [],
}
) => {
  // Define schema for social identities
  const SocialIdentitySchema = new Schema({
    provider: {
      type: String,
      required: true,
      enum: Object.values(AuthProvider)
    },
    providerUserId: {
      type: String,
      required: true
    },
    email: String,
    profileData: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map()
    },
    tokens: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  }, { _id: false });

  // Create compound index for provider + providerUserId
  SocialIdentitySchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

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
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    birthDate: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: userGender,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    // Track primary authentication method
    primaryProvider: {
      type: String,
      enum: Object.values(AuthProvider),
    },
    // Local auth credentials
    password: {
      type: String,
      require: true,
    },
    // Social identities array for multiple providers
    socialIdentities: [SocialIdentitySchema],
    isDeleted: {
      type: Boolean,
      required: true,
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

  // Create compound index for social identities
  customizedUserSchema.index({ 'socialIdentities.provider': 1, 'socialIdentities.providerUserId': 1 });

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
