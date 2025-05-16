import { Document } from 'mongoose';
import { IUserDocument } from '../../users/interfaces/users.interface';

export interface IResource extends Document {
  name: string;
  description?: string;
  allowedActions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEndpointConfig extends Document {
  path: string;
  method: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission extends Document {
  resourceName: string;
  actions: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role extends Document {
  name: string;
  description?: string;
  permissions: Map<string, string[]>;
  isSystem?: boolean;
  createdAt: Date;
  updatedAt: Date;
  hasPermission(resource: string, action: string): boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: {
    [resourceName: string]: string[];
  };
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: {
    [resourceName: string]: string[];
  };
}

export interface CheckPermissionParams {
  user: IUserDocument;
  resource?: string;
  action?: string;
  path?: string;
  method?: string;
}

export interface ResolvedPermission {
  resource: string;
  action: string;
  source: 'params' | 'database' | 'default';
}

export interface CreateResourceDto {
  name: string;
  description?: string;
  allowedActions: string[];
}

export interface UpdateResourceDto {
  name?: string;
  description?: string;
  allowedActions?: string[];
  isActive?: boolean;
}

export interface CreateEndpointConfigDto {
  path: string;
  method: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdateEndpointConfigDto {
  path?: string;
  method?: string;
  resource?: string;
  action?: string;
  description?: string;
  isActive?: boolean;
}

export interface AuthzService {
  // Role management
  createRole(roleData: CreateRoleDto): Promise<Role>;
  getRoles(): Promise<Role[]>;
  updateRole(id: string, roleData: UpdateRoleDto): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  
  // Permission management
  checkPermission(params: CheckPermissionParams): Promise<boolean>;
  getPermissions(): Promise<Permission[]>;
  
  // Resource management
  createResource(resourceData: CreateResourceDto): Promise<IResource>;
  getResources(): Promise<IResource[]>;
  updateResource(id: string, resourceData: UpdateResourceDto): Promise<IResource>;
  deleteResource(id: string): Promise<void>;
  
  // Endpoint config management
  createEndpointConfig(configData: CreateEndpointConfigDto): Promise<IEndpointConfig>;
  getEndpointConfigs(): Promise<IEndpointConfig[]>;
  updateEndpointConfig(id: string, configData: UpdateEndpointConfigDto): Promise<IEndpointConfig>;
  deleteEndpointConfig(id: string): Promise<void>;
}