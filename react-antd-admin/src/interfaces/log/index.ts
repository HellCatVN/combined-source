export interface ILog {
  userActionId: {
    username: string;
  };
  action: string;
  record: string;
  schema: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayloadGetLogs {
  size?: number;
  index?: number;
}
