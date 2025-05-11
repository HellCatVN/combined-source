import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  abacPolicies: {
    resource: string;
    action: string;
    conditions: {
      attribute: string;
      operator: string;
      value: any;
    }[];
  }[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    abacPolicies: [{
      resource: {
        type: String,
        required: true,
      },
      action: {
        type: String,
        required: true,
      },
      conditions: [{
        attribute: {
          type: String,
          required: true,
        },
        operator: {
          type: String,
          required: true,
          enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'in', 'notIn'],
        },
        value: {
          type: Schema.Types.Mixed,
          required: true,
        },
      }],
    }],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);