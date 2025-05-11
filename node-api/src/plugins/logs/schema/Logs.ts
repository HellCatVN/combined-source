import mongoose, { Schema } from 'mongoose';

// Interfaces
import { ILogs } from '../interface/logs.interface';

// Enums
import { logActions } from '../enum/logs.enum';

export const logsSchema = new Schema<ILogs>(
    {
        userActionId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
        },
        action: {
            type: String,
            enum: logActions,
            required: true,
        },
        record: {
            type: String,
            required: true
        },
        schema: {
            type: String,
            required: true
        },
        note: {
            type: String,
            required: false
        }

    },
    {
        timestamps: true,
    }
);


export const LogsCollectionCreator = (dbInstance: mongoose.Connection) => {
    return dbInstance.model<ILogs>('Logs', logsSchema, 'Logs');
};
