import { ZodObject } from "zod";
import { Document, Types } from "mongoose";
import { Model } from "mongoose";
import { userGender, userStatus } from "../enum/user.enum";
import { Role } from "../../authz/interface/authz.interface";

export interface IUser {
  _id: string;
  status: userStatus;
  role: Types.ObjectId | Role;
  name: string;
  username: string;
  email: string;
  birthDate: Date;
  gender: userGender;
  phone: string;
  password: string;
  isDeleted: boolean;
}

export interface IUserDocument extends Omit<IUser, 'role'>, Document {
  _id: string;
  role: Types.ObjectId;
}

export interface IPopulatedUser extends Omit<IUser, 'role'> {
  role: Role;
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