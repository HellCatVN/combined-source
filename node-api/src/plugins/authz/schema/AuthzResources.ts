import { Schema } from 'mongoose';
import { IResource } from '../interface/authz.interface';

export const authzResourcesSchema = new Schema<IResource>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    allowedActions: [{
      type: String,
      required: true,
    }],
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

// Create indexes
authzResourcesSchema.index({ name: 1 });