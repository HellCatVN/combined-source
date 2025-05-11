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
