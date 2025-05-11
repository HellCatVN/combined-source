export class HttpException extends Error {
  public status: number;
  public message: string;
  public forceLogout?: boolean;

  constructor(status: number, message: string, forceLogout?: boolean) {
    super(message);
    this.status = status;
    this.message = message;
    this.forceLogout = forceLogout
  }
}
