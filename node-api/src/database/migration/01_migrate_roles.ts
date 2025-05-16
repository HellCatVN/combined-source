import { Model, Types } from 'mongoose';
import { Role, IResource } from '../../plugins/authz/interface/authz.interface';
import { IUserDocument } from '../../plugins/users/interfaces/users.interface';
import { IMigrationContext, Logger, RoleMappingConfig } from '../types/migration.types';
import { dbInstance } from '../../database';
import { SPECIAL_RESOURCES, SPECIAL_ACTIONS, SUPERADMIN_ROLE } from '../../plugins/authz/constants';

/**
 * Default resources and their allowed actions
 */
const defaultResources = [
  {
    name: 'users',
    description: 'User management',
    allowedActions: ['manage', 'create', 'read', 'update', 'delete', 'list']
  },
  {
    name: 'roles',
    description: 'Role management',
    allowedActions: ['manage', 'create', 'read', 'update', 'delete', 'list']
  },
  {
    name: 'resources',
    description: 'Resource management',
    allowedActions: ['manage', 'create', 'read', 'update', 'delete', 'list']
  }
];

const roleMapping: RoleMappingConfig = {
  [SUPERADMIN_ROLE]: {
    name: SUPERADMIN_ROLE,
    description: 'Super administrator with unrestricted access to all resources',
    permissions: [
      { resource: SPECIAL_RESOURCES.ALL, action: SPECIAL_ACTIONS.ALL }
    ],
    isSystem: true
  },
  admin: {
    name: 'admin',
    description: 'System administrator with full access to defined resources',
    permissions: [
      { resource: 'users', action: SPECIAL_ACTIONS.MANAGE },
      { resource: 'roles', action: SPECIAL_ACTIONS.MANAGE },
      { resource: 'resources', action: SPECIAL_ACTIONS.MANAGE }
    ],
    isSystem: true
  },
  manager: {
    name: 'manager',
    description: 'Manager with full access to users',
    permissions: [
      { resource: 'users', action: SPECIAL_ACTIONS.MANAGE },
      { resource: 'resources', action: 'read' },
      { resource: 'resources', action: 'list' }
    ],
    isSystem: true
  },
  user: {
    name: 'user',
    description: 'Standard user with basic permissions',
    permissions: [
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'resources', action: 'read' },
      { resource: 'resources', action: 'list' }
    ],
    isSystem: true
  }
};

export class RoleMigration {
  private async createResource(
    resourceModel: Model<IResource>,
    resource: typeof defaultResources[0],
    session: any,
    logger: Logger
  ): Promise<void> {
    try {
      const existing = await resourceModel.findOne({ name: resource.name }).session(session);
      if (!existing) {
        await resourceModel.create([{
          ...resource,
          isActive: true
        }], { session });
        logger.info(`✅ Created resource: ${resource.name}`);
      } else {
        logger.info(`ℹ️ Resource already exists: ${resource.name}`);
      }
    } catch (error) {
      logger.error(`❌ Failed to create resource ${resource.name}:`, error);
      throw error;
    }
  }

  private async createRole(
    roleModel: Model<Role>,
    name: string,
    config: RoleMappingConfig[string],
    session: any,
    logger: Logger
  ): Promise<Types.ObjectId | null> {
    try {
      const existingRole = await roleModel.findOne({ name: config.name }).session(session);
      if (existingRole) {
        return existingRole._id as Types.ObjectId;
      }

      const role = await roleModel.create([{
        name: config.name,
        description: config.description,
        permissions: config.permissions,
        isSystem: true
      }], { session });

      return role[0]._id as Types.ObjectId;
    } catch (error) {
      logger.error(`❌ Failed to create role ${name}:`, error);
      return null;
    }
  }

  async up(
    userModel: Model<IUserDocument>,
    roleModel: Model<Role>,
    resourceModel: Model<IResource>,
    logger: Logger
  ): Promise<void> {
    const context: IMigrationContext = {
      oldRoles: [],
      newRoles: new Map(),
      errors: [],
      processed: 0,
      skipped: 0,
      updated: 0
    };

    const session = await dbInstance.startSession();
    
    try {
      await session.withTransaction(async () => {
        // First create all resources
        logger.info('📦 Creating default resources...');
        for (const resource of defaultResources) {
          await this.createResource(resourceModel, resource, session, logger);
        }

        // Get distinct roles from users
        const oldRoles = await userModel.distinct('role').session(session);
        context.oldRoles = (oldRoles as any[]).map(role => role.toString());
        logger.info(`🔍 Found ${context.oldRoles.length} distinct roles to migrate`);

        // Create new roles and build mapping
        for (const [oldRole, config] of Object.entries(roleMapping)) {
          const roleId = await this.createRole(roleModel, oldRole, config, session, logger);
          if (roleId) {
            context.newRoles.set(oldRole, roleId);
          }
        }

        // Update users with new role references
        const cursor = userModel.find({}).session(session).cursor();

        for await (const user of cursor) {
          context.processed++;
          
          const oldRole = user.role?.toString();
          if (!oldRole) {
            context.skipped++;
            context.errors.push({
              userId: user._id.toString(),
              oldRole: 'undefined',
              error: 'No role found for user',
              timestamp: new Date()
            });
            continue;
          }

          const newRoleId = context.newRoles.get(oldRole);
          if (!newRoleId) {
            context.skipped++;
            context.errors.push({
              userId: user._id.toString(),
              oldRole,
              error: 'No mapping found for role',
              timestamp: new Date()
            });
            continue;
          }

          try {
            await userModel.updateOne(
              { _id: user._id },
              { $set: { role: newRoleId } }
            ).session(session);
            context.updated++;
          } catch (error) {
            context.errors.push({
              userId: user._id.toString(),
              oldRole,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date()
            });
          }
        }

        // Log results
        logger.info(`✅ Migration completed:
          ◾ Processed: ${context.processed}
          ◾ Updated: ${context.updated}
          ◾ Skipped: ${context.skipped}
          ◾ Errors: ${context.errors.length}`);

        if (context.errors.length > 0) {
          logger.warn('⚠️ Migration completed with errors:', { errors: context.errors });
        }
      });
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async down(
    userModel: Model<IUserDocument>,
    roleModel: Model<Role>,
    resourceModel: Model<IResource>,
    logger: Logger
  ): Promise<void> {
    const session = await dbInstance.startSession();
    
    try {
      await session.withTransaction(async () => {
        logger.info('⬇️ Rolling back role migration...');
        
        // Delete migrated roles
        await roleModel.deleteMany({
          name: { $in: Object.values(roleMapping).map(r => r.name) }
        }).session(session);

        // Reset user roles to default
        await userModel.updateMany(
          {},
          { $set: { role: 'user' } }
        ).session(session);

        // Delete migrated resources
        await resourceModel.deleteMany({
          name: { $in: defaultResources.map(r => r.name) }
        }).session(session);

        logger.info('✅ Successfully rolled back role and resource migration');
      });
    } catch (error) {
      logger.error('❌ Rollback failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}