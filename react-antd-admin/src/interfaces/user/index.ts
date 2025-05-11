import { userRole } from 'enums/user';

export interface IClientUser {
  _id: string;
  name: string;
  email: string;
  role: userRole;
  username: string;
  balance?: number;
  phone?: string;
  active?: string;
  avatar?: string;
}

export interface IPayloadGetUsers {
  size?: number;
  index?: number;
  status?: string;
  role?: string;
  name?: string;
}

export interface IEditUserForm extends Omit<IClientUser, '_id' | 'role'> {
  role: string;
  status: string;
}

export interface ISelfUpdateForm {
  name: string;
  email: string;
  phone?: string;
}
