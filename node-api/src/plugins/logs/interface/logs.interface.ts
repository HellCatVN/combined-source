import { Schema } from "mongoose";
import { logActions } from "../enum/logs.enum";

export interface ILogs {
    _id: Schema.Types.ObjectId,
    userActionId: Schema.Types.ObjectId,
    action: logActions,
    record: string,
    schema: string,
    note?: string,
    createdAt?: Date,
    updatedAt?: Date;
}
