/**
 * Database setup script
 * Creates database and runs migrations
 */

import knex from '../src/config/database.js';
import logger from '../src/utils/logger.js';

async function setupDatabase() {
  try {
    logger.info('Starting database setup...');

    // Run migrations
    logger.info('Running migrations...');
    await knex.migrate.latest();
    logger.info('✓ Migrations completed');

    // Run seeds (only in development)
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Seeding database...');
      await knex.seed.run();
      logger.info('✓ Database seeded');
    }

    logger.info('✓ Database setup complete');
    process.exit(0);
  } catch (error) {
    logger.error(`Database setup failed: ${error}`);
    process.exit(1);
  }
}

setupDatabase();