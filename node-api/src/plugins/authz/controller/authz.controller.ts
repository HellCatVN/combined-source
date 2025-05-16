import { Request, Response, NextFunction } from 'express';
import { Container } from 'inversify';
import { AuthzService } from '../interface/authz.interface';
import { IUserDocument } from '../../users/interfaces/users.interface';

export class AuthzController {
  private authzService: AuthzService;

  constructor(container: Container) {
    this.authzService = container.get<AuthzService>('AuthzService');
  }

  public getPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await this.authzService.getPermissions();
      res.status(200).json({ data: permissions, message: 'getPermissions' });
    } catch (error) {
      next(error);
    }
  };

  public createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleData = req.body;
      const role = await this.authzService.createRole(roleData);
      res.status(201).json({ data: role, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await this.authzService.getRoles();
      res.status(200).json({ data: roles, message: 'getRoles' });
    } catch (error) {
      next(error);
    }
  };

  public updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const roleData = req.body;
      const updatedRole = await this.authzService.updateRole(id, roleData);
      res.status(200).json({ data: updatedRole, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      await this.authzService.deleteRole(id);
      res.status(200).json({ message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public checkPermission = async (user: IUserDocument, resource: string, action: string): Promise<boolean> => {
    return this.authzService.checkPermission({ user, resource, action });
  };

  // Resource Management Endpoints
  public createResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceData = req.body;
      const resource = await this.authzService.createResource(resourceData);
      res.status(201).json({ data: resource, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getResources = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resources = await this.authzService.getResources();
      res.status(200).json({ data: resources, message: 'getResources' });
    } catch (error) {
      next(error);
    }
  };

  public updateResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const resourceData = req.body;
      const updatedResource = await this.authzService.updateResource(id, resourceData);
      res.status(200).json({ data: updatedResource, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      await this.authzService.deleteResource(id);
      res.status(200).json({ message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint Config Management Endpoints
  public createEndpointConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const configData = req.body;
      const endpointConfig = await this.authzService.createEndpointConfig(configData);
      res.status(201).json({ data: endpointConfig, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getEndpointConfigs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const configs = await this.authzService.getEndpointConfigs();
      res.status(200).json({ data: configs, message: 'getEndpointConfigs' });
    } catch (error) {
      next(error);
    }
  };

  public updateEndpointConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const configData = req.body;
      const updatedConfig = await this.authzService.updateEndpointConfig(id, configData);
      res.status(200).json({ data: updatedConfig, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteEndpointConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      await this.authzService.deleteEndpointConfig(id);
      res.status(200).json({ message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}