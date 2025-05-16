import { logger } from '../../utils/logger';
import { sleep } from '@utils/index';
import { dbInstance, models } from '../../database';
import { RoleMigration } from './01_migrate_roles';

const roleMigration = new RoleMigration();

const migrations = [
  {
    name: 'Role Migration',
    up: async () => {
      const { Users, AuthzRoles, AuthzResources } = models;
      await roleMigration.up(Users, AuthzRoles, AuthzResources, logger);
    },
    down: async () => {
      const { Users, AuthzRoles, AuthzResources } = models;
      await roleMigration.down(Users, AuthzRoles, AuthzResources, logger);
    }
  }
];

type MigrationDirection = 'up' | 'down';

async function runMigrations(direction: MigrationDirection = 'up') {
  try {
    const action = direction === 'up' ? 'applying' : 'rolling back';
    logger.info(`🔄 Starting migrations (${action})...`);
    await sleep(5000); // Wait for database connection to be established
    
    const migrationList = direction === 'up' ? migrations : [...migrations].reverse();
    
    for (const migration of migrationList) {
      try {
        const operation = direction === 'up' ? migration.up : migration.down;
        logger.info(`${direction === 'up' ? '⬆️' : '⬇️'} ${action} migration: ${migration.name}`);
        await operation();
        logger.info(`✅ Migration ${migration.name} ${direction} completed successfully`);
      } catch (error) {
        logger.error(`❌ Migration ${migration.name} ${direction} failed:`, error);
        throw error;
      }
    }

    logger.info(`✅ All migrations ${direction} completed successfully`);
  } catch (error) {
    logger.error(`❌ Migration process (${direction}) failed:`, error);
    process.exit(1);
  }
}

// Execute if this script is run directly
if (require.main === module) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  runMigrations(direction)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigrations };