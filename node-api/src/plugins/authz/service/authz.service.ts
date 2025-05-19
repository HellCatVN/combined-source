import { Model } from 'mongoose';
import { HttpException } from '@exceptions/HttpException';
import { httpStatusCode } from '@constants/httpStatusCode';
import {
  CreateRoleDto, UpdateRoleDto, CheckPermissionParams,
  CreateResourceDto, UpdateResourceDto,
  CreateEndpointConfigDto, UpdateEndpointConfigDto,
  Permission, Role, IResource, IEndpointConfig
} from '../interface/authz.interface';
import { SPECIAL_RESOURCES, SPECIAL_ACTIONS, SUPERADMIN_ROLE } from '../constants';
import { authzContainer } from '../authzContainer';

class AuthzService {
  private roleModel = authzContainer.get<Model<Role>>('AuthzRolesCollection');
  private resourceModel = authzContainer.get<Model<IResource>>('AuthzResourcesCollection');
  private endpointConfigModel = authzContainer.get<Model<IEndpointConfig>>('AuthzEndpointConfigCollection');

  public async createRole(roleData: CreateRoleDto) {
    if (!roleData.name) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Role name is required');
    }

    if (!Array.isArray(roleData.permissions)) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Permissions must be an array');
    }

    const existingRole = await this.roleModel.findOne({ name: roleData.name });
    if (existingRole) {
      throw new HttpException(httpStatusCode.ClientError.Conflict, `Role ${roleData.name} already exists`);
    }

    // Validate permissions against existing resources
    const resources = await this.resourceModel.find();
    const resourceMap = new Map(resources.map(r => [r.name, r.allowedActions]));

    for (const permission of roleData.permissions) {
      // Skip validation for special resources
      if (permission.resource === SPECIAL_RESOURCES.ALL || permission.resource === SPECIAL_RESOURCES.WILDCARD) {
        continue;
      }

      const allowedActions = resourceMap.get(permission.resource);
      if (!allowedActions) {
        throw new HttpException(
          httpStatusCode.ClientError.BadRequest,
          `Invalid resource: ${permission.resource}`
        );
      }
      
      // Skip validation for special actions
      if (permission.action === SPECIAL_ACTIONS.ALL || permission.action === SPECIAL_ACTIONS.MANAGE) {
        continue;
      }

      if (!allowedActions.includes(permission.action)) {
        throw new HttpException(
          httpStatusCode.ClientError.BadRequest,
          `Invalid action '${permission.action}' for resource '${permission.resource}'`
        );
      }
    }

    const role = new this.roleModel(roleData);
    await role.save();
    return role;
  }

  public async getRoles() {
    return await this.roleModel.find();
  }

  public async getRoleById(id: string) {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Role not found');
    }
    return role;
  }

  public async updateRole(id: string, roleData: UpdateRoleDto, userRole?: Role) {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Role not found');
    }

    // Only block system role modification if user is not superadmin
    if (role.isSystem && (!userRole || userRole.name !== SUPERADMIN_ROLE)) {
      throw new HttpException(httpStatusCode.ClientError.Forbidden, 'System roles cannot be modified');
    }

    if (roleData.permissions) {
      if (!Array.isArray(roleData.permissions)) {
        throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Permissions must be an array');
      }

      // Validate permissions against existing resources
      const resources = await this.resourceModel.find();
      const resourceMap = new Map(resources.map(r => [r.name, r.allowedActions]));

      for (const permission of roleData.permissions) {
        // Skip validation for special resources
        if (permission.resource === SPECIAL_RESOURCES.ALL || permission.resource === SPECIAL_RESOURCES.WILDCARD) {
          continue;
        }

        const allowedActions = resourceMap.get(permission.resource);
        if (!allowedActions) {
          throw new HttpException(
            httpStatusCode.ClientError.BadRequest,
            `Invalid resource: ${permission.resource}`
          );
        }
        
        // Skip validation for special actions
        if (permission.action === SPECIAL_ACTIONS.ALL || permission.action === SPECIAL_ACTIONS.MANAGE) {
          continue;
        }

        if (!allowedActions.includes(permission.action)) {
          throw new HttpException(
            httpStatusCode.ClientError.BadRequest,
            `Invalid action '${permission.action}' for resource '${permission.resource}'`
          );
        }
      }
    }

    Object.assign(role, roleData);
    await role.save();
    return role;
  }

  public async deleteRole(id: string) {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Role not found');
    }

    if (role.isSystem) {
      throw new HttpException(httpStatusCode.ClientError.Forbidden, 'System roles cannot be deleted');
    }

    await role.deleteOne();
  }

  private isPopulatedRole(role: any): role is Role {
    return role && typeof role === 'object' && 'name' in role && 'permissions' in role;
  }

  private matchesSpecialResource(permission: Permission, resource: string): boolean {
    return permission.resource === SPECIAL_RESOURCES.ALL || 
           permission.resource === SPECIAL_RESOURCES.WILDCARD || 
           permission.resource === resource;
  }

  private matchesSpecialAction(permission: Permission, action: string): boolean {
    return permission.action === SPECIAL_ACTIONS.ALL || 
           permission.action === SPECIAL_ACTIONS.MANAGE || 
           permission.action === action;
  }

  public async checkPermission({ user, resource, action }: CheckPermissionParams) {
    if (!user || !resource || !action) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Missing required parameters');
    }

    let userRole: Role | null;
    
    if (this.isPopulatedRole(user.role)) {
      userRole = user.role;
    } else {
      userRole = await this.roleModel.findById(user.role);
    }

    if (!userRole) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'User role not found');
    }

    // Check for superadmin role
    if (userRole.name === SUPERADMIN_ROLE) {
      return true;
    }

    // Check role's permissions including special cases
    return userRole.permissions.some(permission => 
      this.matchesSpecialResource(permission, resource) && 
      this.matchesSpecialAction(permission, action)
    );
  }

  public async getPermissions() {
    const resources = await this.resourceModel.find();
    const permissions: Permission[] = [];
    
    resources.forEach(resource => {
      resource.allowedActions.forEach(action => {
        permissions.push({
          resource: resource.name,
          action: action
        });
      });
    });
    
    return permissions;
  }

  // Resource Management Methods
  public async createResource(resourceData: CreateResourceDto) {
    if (!resourceData.name) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Resource name is required');
    }

    const existingResource = await this.resourceModel.findOne({ name: resourceData.name });
    if (existingResource) {
      throw new HttpException(httpStatusCode.ClientError.Conflict, `Resource ${resourceData.name} already exists`);
    }

    const resource = new this.resourceModel(resourceData);
    await resource.save();
    return resource;
  }

  public async getResources() {
    return await this.resourceModel.find();
  }

  public async getResourceById(id: string) {
    const resource = await this.resourceModel.findById(id);
    if (!resource) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Resource not found');
    }
    return resource;
  }

  public async updateResource(id: string, resourceData: UpdateResourceDto) {
    const resource = await this.resourceModel.findById(id);
    if (!resource) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Resource not found');
    }

    Object.assign(resource, resourceData);
    await resource.save();
    return resource;
  }

  public async deleteResource(id: string) {
    const resource = await this.resourceModel.findById(id);
    if (!resource) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Resource not found');
    }

    await resource.deleteOne();
  }

  // Endpoint Config Management Methods
  public async createEndpointConfig(configData: CreateEndpointConfigDto) {
    if (!configData.path || !configData.method) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Path and method are required');
    }

    const existingConfig = await this.endpointConfigModel.findOne({
      path: configData.path,
      method: configData.method
    });
    if (existingConfig) {
      throw new HttpException(httpStatusCode.ClientError.Conflict, `Endpoint config for ${configData.method} ${configData.path} already exists`);
    }

    const endpointConfig = new this.endpointConfigModel(configData);
    await endpointConfig.save();
    return endpointConfig;
  }

  public async getEndpointConfigs() {
    return await this.endpointConfigModel.find();
  }

  public async getEndpointConfigById(id: string) {
    const config = await this.endpointConfigModel.findById(id);
    if (!config) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Endpoint config not found');
    }
    return config;
  }

  public async updateEndpointConfig(id: string, configData: UpdateEndpointConfigDto) {
    const config = await this.endpointConfigModel.findById(id);
    if (!config) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Endpoint config not found');
    }

    Object.assign(config, configData);
    await config.save();
    return config;
  }

  public async deleteEndpointConfig(id: string) {
    const config = await this.endpointConfigModel.findById(id);
    if (!config) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Endpoint config not found');
    }

    await config.deleteOne();
  }
}

export default AuthzService;