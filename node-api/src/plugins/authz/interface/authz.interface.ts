import { Request } from "express";

export type Operator = 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';

export interface AbacCondition {
  attribute: string;
  operator: Operator;
  value: any;
}

export interface AbacPolicy {
  resource: string;
  action: string;
  conditions: AbacCondition[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  abacPolicies: AbacPolicy[];
}

export interface EditRoleAbacDto {
  abacPolicies: AbacPolicy[];
}

export interface AddAbacPolicyDto {
  policy: AbacPolicy;
}

export interface ValidateAccessDto {
  roleId: string;
  resource: string;
  action: string;
  context: Record<string, any>;
}

export interface IRequestWithUser extends Request {
  user: {
    role: string;
    [key: string]: any;
  };
}

export interface IAuthzService {
  createRole(roleData: CreateRoleDto, creatorRole: string): Promise<any>;
  editRoleAbac(roleId: string, abacPolicies: AbacPolicy[], editorRole: string): Promise<any>;
  addAbacPolicy(roleId: string, policy: AbacPolicy, editorRole: string): Promise<any>;
  validateAccess(roleId: string, resource: string, action: string, context: Record<string, any>): Promise<boolean>;
}