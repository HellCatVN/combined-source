import { NextFunction, Response } from "express";
import { injectable, inject } from "inversify";
import { AuthzService } from "../service/authz.service";
import { httpStatusCode } from "../../../constants/httpStatusCode";
import { logger } from "@utils/logger";
import { IRequestWithUser } from "../interface/authz.interface";

@injectable()
class AuthzController {
  constructor(
    @inject(AuthzService) private authzService: AuthzService
  ) {}

  public createRole = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { name, description, abacPolicies } = req.body;
      const creatorRole = req.user.role;

      const role = await this.authzService.createRole(
        { name, description, abacPolicies },
        creatorRole
      );

      const response = {
        status: httpStatusCode.Success.OK,
        message: 'Role created successfully',
        data: { role },
      };

      res.status(httpStatusCode.Success.OK).json(response);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  public editRoleAbac = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { roleId } = req.params;
      const { abacPolicies } = req.body;
      const editorRole = req.user.role;

      const updatedRole = await this.authzService.editRoleAbac(
        roleId,
        abacPolicies,
        editorRole
      );

      const response = {
        status: httpStatusCode.Success.OK,
        message: 'Role ABAC policies updated successfully',
        data: { role: updatedRole },
      };

      res.status(httpStatusCode.Success.OK).json(response);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  public addAbacPolicy = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { roleId } = req.params;
      const { policy } = req.body;
      const editorRole = req.user.role;

      const updatedRole = await this.authzService.addAbacPolicy(
        roleId,
        policy,
        editorRole
      );

      const response = {
        status: httpStatusCode.Success.OK,
        message: 'ABAC policy added successfully',
        data: { role: updatedRole },
      };

      res.status(httpStatusCode.Success.OK).json(response);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  public validateAccess = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { roleId, resource, action, context } = req.body;

      const hasAccess = await this.authzService.validateAccess(
        roleId,
        resource,
        action,
        context
      );

      const response = {
        status: httpStatusCode.Success.OK,
        message: 'Access validation completed',
        data: { hasAccess },
      };

      res.status(httpStatusCode.Success.OK).json(response);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}

export default AuthzController;