import { Schema } from 'mongoose';
import { IEndpointConfig } from '../interface/authz.interface';

export const authzEndpointConfigSchema = new Schema<IEndpointConfig>(
  {
    path: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    resource: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create compound index for unique endpoint configs
authzEndpointConfigSchema.index({ path: 1, method: 1 }, { unique: true });
authzEndpointConfigSchema.index({ resource: 1, action: 1 });