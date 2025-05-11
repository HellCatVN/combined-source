import { injectable } from 'inversify';
import { Enforcer, newEnforcer } from 'casbin';
import { MongooseAdapter } from 'casbin-mongoose-adapter';
import path from 'path';
import mongoose from 'mongoose';

@injectable()
export class EnforcerService {
  private enforcer: Enforcer;

  constructor() {
    this.initializeEnforcer();
  }

  private async initializeEnforcer() {
    try {
      const modelPath = path.join(__dirname, '../config/model.conf');
      const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';
      const adapter = await MongooseAdapter.newAdapter(dbUrl);
      this.enforcer = await newEnforcer(modelPath, adapter);
      
      // Add some default policies
      await this.addDefaultPolicies();
    } catch (error) {
      console.error('Failed to initialize Casbin enforcer:', error);
      throw error;
    }
  }

  private async addDefaultPolicies() {
    // Only add default policies if none exist
    const policies = await this.enforcer.getPolicy();
    if (policies.length === 0) {
      // Add superadmin role with full access
      await this.enforcer.addPolicy('superadmin', '*', '*', 'allow');
      
      // Add inheritance - superadmin inherits all roles
      await this.enforcer.addGroupingPolicy('superadmin', '*');
      
      // Save the policies to database
      await this.enforcer.savePolicy();
    }
  }

  async addRole(role: string, parentRole?: string): Promise<boolean> {
    if (parentRole) {
      const added = await this.enforcer.addGroupingPolicy(role, parentRole);
      if (added) {
        await this.enforcer.savePolicy();
      }
      return added;
    }
    return true;
  }

  async addPolicy(role: string, resource: string, action: string, effect: string = 'allow'): Promise<boolean> {
    const added = await this.enforcer.addPolicy(role, resource, action, effect);
    if (added) {
      await this.enforcer.savePolicy();
    }
    return added;
  }

  async removePolicy(role: string, resource: string, action: string, effect: string = 'allow'): Promise<boolean> {
    const removed = await this.enforcer.removePolicy(role, resource, action, effect);
    if (removed) {
      await this.enforcer.savePolicy();
    }
    return removed;
  }

  async addPoliciesForRole(role: string, policies: Array<{ resource: string; action: string; effect?: string }>): Promise<boolean> {
    const rules = policies.map(p => [role, p.resource, p.action, p.effect || 'allow']);
    const added = await this.enforcer.addPolicies(rules);
    if (added) {
      await this.enforcer.savePolicy();
    }
    return added;
  }

  async getRolePolicies(role: string): Promise<string[][]> {
    return await this.enforcer.getFilteredPolicy(0, role);
  }

  async enforce(subject: string, resource: string, action: string): Promise<boolean> {
    return await this.enforcer.enforce(subject, resource, action);
  }

  async getUserRoles(username: string): Promise<string[]> {
    return await this.enforcer.getRolesForUser(username);
  }

  async addRoleForUser(username: string, role: string): Promise<boolean> {
    const added = await this.enforcer.addGroupingPolicy(username, role);
    if (added) {
      await this.enforcer.savePolicy();
    }
    return added;
  }

  async removeRoleForUser(username: string, role: string): Promise<boolean> {
    const removed = await this.enforcer.removeGroupingPolicy(username, role);
    if (removed) {
      await this.enforcer.savePolicy();
    }
    return removed;
  }

  async hasRole(username: string, role: string): Promise<boolean> {
    const roles = await this.getUserRoles(username);
    return roles.includes(role);
  }

  // ABAC related methods
  async addABACPolicy(role: string, resource: string, action: string, condition: string): Promise<boolean> {
    const added = await this.enforcer.addPolicy(role, resource, action, 'allow', condition);
    if (added) {
      await this.enforcer.savePolicy();
    }
    return added;
  }

  async enforceWithContext(subject: string, resource: string, action: string, context: any): Promise<boolean> {
    return await this.enforcer.enforce(subject, resource, action, context);
  }
}