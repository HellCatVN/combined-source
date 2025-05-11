import { ZodObject } from "zod";
import { Document } from "mongoose";
import { Model } from "mongoose";
import { userGender, userStatus } from "../enum/user.enum";

export interface IUser {
  _id: string;
  status: userStatus;
  role: string;
  name: string;
  username: string;
  email: string;
  birthDate: Date;
  gender: userGender;
  phone: string;
  password: string;
  isDeleted: boolean;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
}

export interface IUserPermission {
  action: string;
  subject: string;
}

export interface ICustomerValidatorUserRules {
  customUserPayloadRules: ZodObject<any, any, any, any, any>;
}

export interface ICustomRelatedModels {
  relatedModels: Model<any>[];
}