import { Schema } from 'mongoose';
import { Role } from '../interface/authz.interface';
import { HttpException } from '@exceptions/HttpException';
import { SPECIAL_ACTIONS, SPECIAL_RESOURCES, SUPERADMIN_ROLE } from '../constants';

export const authzRolesSchema = new Schema<Role>(
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
    permissions: [{
      resource: {
        type: String,
        required: true
      },
      action: {
        type: String,
        required: true
      }
    }],
    isSystem: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create indexes for faster queries
authzRolesSchema.index({ name: 1 });

// Validate permissions against existing resources
authzRolesSchema.pre('save', async function(next) {
  try {
    // Resource validation will be handled by the service layer
    next();
  } catch (error) {
    next(new HttpException(400, error.message));
  }
});

// Enhanced method to check if role has specific permission
authzRolesSchema.methods.hasPermission = function(resource: string, action: string): boolean {
  // Super admin role has full access
  if (this.name === SUPERADMIN_ROLE) {
    return true;
  }

  return this.permissions.some(permission => {
    // Check for global wildcard permission
    if (permission.resource === SPECIAL_RESOURCES.ALL || permission.resource === SPECIAL_RESOURCES.WILDCARD) {
      if (permission.action === SPECIAL_ACTIONS.ALL || permission.action === SPECIAL_ACTIONS.MANAGE) {
        return true;
      }
    }

    // Check for resource-level wildcard action
    if (permission.resource === resource) {
      if (permission.action === SPECIAL_ACTIONS.ALL || 
          permission.action === SPECIAL_ACTIONS.MANAGE) {
        return true;
      }
    }

    // Check for exact match
    if (permission.resource === resource && permission.action === action) {
      return true;
    }
    
    // Check for hierarchical permissions (e.g., 'posts:*' matches 'posts:create')
    if (permission.resource === resource && permission.action.endsWith(':*')) {
      const prefix = permission.action.slice(0, -1); // Remove '*'
      if (action.startsWith(prefix)) {
        return true;
      }
    }
    
    return false;
  });
};