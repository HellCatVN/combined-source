import { Schema } from 'mongoose';
import { Role } from '../interface/authz.interface';
import { HttpException } from '@exceptions/HttpException';

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
    permissions: {
      type: Map,
      of: [String],
      default: new Map(),
    },
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
    const role = this;
    const resources = Array.from(role.permissions.keys());
    
    // Note: Resource validation will be handled by the service layer
    // since we'll be using dependency injection for the resource model
    next();
  } catch (error) {
    next(new HttpException(400, error.message));
  }
});

// Enhanced method to check if role has specific permission
authzRolesSchema.methods.hasPermission = function(resource: string, action: string): boolean {
  // Check if role has direct permission
  const actions = this.permissions.get(resource);
  if (!actions) return false;
  
  // Check for specific action or wildcard
  if (actions.includes(action) || actions.includes('*')) {
    return true;
  }
  
  // Check for hierarchical permissions (e.g., 'posts:*' matches 'posts:create')
  const wildcardActions = actions.filter(a => a.endsWith(':*'));
  for (const wildcardAction of wildcardActions) {
    const prefix = wildcardAction.slice(0, -1); // Remove '*'
    if (action.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
};