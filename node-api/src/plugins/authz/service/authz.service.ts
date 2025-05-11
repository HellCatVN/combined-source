import { injectable, inject } from 'inversify';
import { Role } from '../schema/Role';
import { EnforcerService } from './enforcer.service';
import { CreateRoleDto } from '../interface/authz.interface';
import { HttpException } from '../../../exceptions/HttpException';
import { httpStatusCode } from '../../../constants/httpStatusCode';

@injectable()
export class AuthzService {
  constructor(
    @inject(EnforcerService) private enforcer: EnforcerService
  ) {}

  async createRole(
    roleData: CreateRoleDto,
    creatorRole: string
  ): Promise<any> {
    // Only superadmin can create roles
    if (creatorRole !== 'superadmin') {
      throw new HttpException(
        httpStatusCode.ClientError.Forbidden,
        'Only superadmin can create roles'
      );
    }

    // Create role in MongoDB for additional metadata
    const role = new Role({
      name: roleData.name,
      description: roleData.description,
    });
    await role.save();

    // Add role to Casbin
    await this.enforcer.addRole(roleData.name);

    // Add ABAC policies
    for (const policy of roleData.abacPolicies) {
      await this.enforcer.addABACPolicy(
        roleData.name,
        policy.resource,
        policy.action,
        this.buildConditionString(policy.conditions)
      );
    }

    return role;
  }

  async editRoleAbac(
    roleId: string,
    abacPolicies: any[],
    editorRole: string
  ): Promise<any> {
    // Only superadmin can edit roles
    if (editorRole !== 'superadmin') {
      throw new HttpException(
        httpStatusCode.ClientError.Forbidden,
        'Only superadmin can edit roles'
      );
    }

    const role = await Role.findById(roleId);
    if (!role) {
      throw new HttpException(
        httpStatusCode.ClientError.NotFound,
        'Role not found'
      );
    }

    // Remove existing policies
    const existingPolicies = await this.enforcer.getRolePolicies(role.name);
    for (const policy of existingPolicies) {
      await this.enforcer.removePolicy(role.name, policy[1], policy[2], policy[3]);
    }

    // Add new policies
    for (const policy of abacPolicies) {
      await this.enforcer.addABACPolicy(
        role.name,
        policy.resource,
        policy.action,
        this.buildConditionString(policy.conditions)
      );
    }

    return role;
  }

  async addAbacPolicy(
    roleId: string,
    policy: any,
    editorRole: string
  ): Promise<any> {
    // Only superadmin can add policies
    if (editorRole !== 'superadmin') {
      throw new HttpException(
        httpStatusCode.ClientError.Forbidden,
        'Only superadmin can add ABAC policies'
      );
    }

    const role = await Role.findById(roleId);
    if (!role) {
      throw new HttpException(
        httpStatusCode.ClientError.NotFound,
        'Role not found'
      );
    }

    await this.enforcer.addABACPolicy(
      role.name,
      policy.resource,
      policy.action,
      this.buildConditionString(policy.conditions)
    );

    return role;
  }

  async validateAccess(
    roleId: string,
    resource: string,
    action: string,
    context: Record<string, any>
  ): Promise<boolean> {
    const role = await Role.findById(roleId);
    if (!role) {
      return false;
    }

    return await this.enforcer.enforceWithContext(role.name, resource, action, context);
  }

  private buildConditionString(conditions: Array<{ attribute: string; operator: string; value: any }>): string {
    return conditions
      .map(c => {
        switch (c.operator) {
          case 'equals':
            return `r.context.${c.attribute} == ${JSON.stringify(c.value)}`;
          case 'notEquals':
            return `r.context.${c.attribute} != ${JSON.stringify(c.value)}`;
          case 'contains':
            return `r.context.${c.attribute}.includes(${JSON.stringify(c.value)})`;
          case 'greaterThan':
            return `r.context.${c.attribute} > ${c.value}`;
          case 'lessThan':
            return `r.context.${c.attribute} < ${c.value}`;
          case 'in':
            return `(${JSON.stringify(c.value)}).includes(r.context.${c.attribute})`;
          case 'notIn':
            return `!(${JSON.stringify(c.value)}).includes(r.context.${c.attribute})`;
          default:
            return '';
        }
      })
      .filter(Boolean)
      .join(' && ');
  }
}