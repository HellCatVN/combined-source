export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: {
    resource: string;
    action: string;
    _id: string;
  }[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissions: {
    resource: string;
    action: string;
  }[];  
}

export interface UpdateRolePayload extends CreateRolePayload {
  _id: string;
}

export type DeleteRolePayload = string;

export interface Resource {
  _id: string;
  name: string;
  description: string;
  allowedActions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourcePayload {
  name: string;
  description: string;
  allowedActions: string[];
  isActive: boolean;
}

export interface UpdateResourcePayload extends CreateResourcePayload {
  _id: string;
}

export type DeleteResourcePayload = string;

export interface EndpointPermission {
  _id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authType: 'any' | 'all';
  permissions: Array<{
    resource: string;
    action: string;
  }>;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEndpointPermissionPayload {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authType: 'any' | 'all';
  permissions: Array<{
    resource: string;
    action: string;
  }>;
  description?: string;
  isActive: boolean;
}

export interface UpdateEndpointPermissionPayload extends CreateEndpointPermissionPayload {
  _id: string;
}

export type DeleteEndpointPermissionPayload = string;