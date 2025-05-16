import { Model } from 'mongoose';
import { HttpException } from '@exceptions/HttpException';
import { httpStatusCode } from '@constants/httpStatusCode';
import { authzContainer } from '../authzContainer';
import { usersContainer } from '../../users';
import UserService from '../../users/service/user.service';
import {
  CreateRoleDto, UpdateRoleDto, CheckPermissionParams,
  CreateResourceDto, UpdateResourceDto,
  CreateEndpointConfigDto, UpdateEndpointConfigDto,
  Permission, Role, IResource, IEndpointConfig
} from '../interface/authz.interface';

class AuthzService {
  public roleModel = authzContainer.get<Model<Role>>('AuthzRolesCollection');
  public resourceModel = authzContainer.get<Model<IResource>>('AuthzResourcesCollection');
  public endpointConfigModel = authzContainer.get<Model<IEndpointConfig>>('AuthzEndpointConfigCollection');
  public userService = usersContainer.get<UserService>('UserService');

  public async createRole(roleData: CreateRoleDto) {
    if (!roleData.name) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Role name is required');
    }

    const existingRole = await this.roleModel.findOne({ name: roleData.name });
    if (existingRole) {
      throw new HttpException(httpStatusCode.ClientError.Conflict, `Role ${roleData.name} already exists`);
    }

    const role = new this.roleModel(roleData);
    await role.save();
    return role;
  }

  public async getRoles() {
    return await this.roleModel.find();
  }

  public async updateRole(id: string, roleData: UpdateRoleDto) {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new HttpException(httpStatusCode.ClientError.NotFound, 'Role not found');
    }

    if (role.isSystem) {
      throw new HttpException(httpStatusCode.ClientError.Forbidden, 'System roles cannot be modified');
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

  public async checkPermission({ user, resource, action }: CheckPermissionParams) {
    if (!user || !resource || !action) {
      throw new HttpException(httpStatusCode.ClientError.BadRequest, 'Missing required parameters');
    }

    // Get user data
    const userData = await this.userService.findUserById(user.username);
    
    // If user has admin role, grant all permissions
    if (userData.role === 'admin') {
      return true;
    }

    // Get all roles associated with the user's role
    const roles = await this.roleModel.find({ name: userData.role });
    
    // Check each role's permissions
    for (const role of roles) {
      if (role.hasPermission(resource, action)) {
        return true;
      }
    }

    return false;
  }

  public async getPermissions() {
    // Get permissions from resources instead
    const resources = await this.resourceModel.find();
    return resources.map(resource => ({
      resourceName: resource.name,
      actions: resource.allowedActions,
      description: resource.description
    }));
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