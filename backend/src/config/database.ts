/**
 * PostgreSQL database configuration
 * Uses Knex for query building and migrations
 */

// Import the default export for Node.js, and the types for TypeScript
import knexSetup from 'knex';
import type { Knex } from 'knex';
import path from 'path';
import logger from '../utils/logger.js';

// Force TypeScript to understand that this is a callable function
const knex = knexSetup as unknown as (config: Knex.Config) => Knex;

// Get database URL from environment
const getDatabaseUrl = (): string => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'test') {
    return process.env.DATABASE_TEST_URL || 'postgresql://postgres:password@localhost:5432/parsnipt_test';
  }

  if (env === 'production') {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is required in production');
    }
    return url;
  }

  // Development
  return (
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/parsnipt_dev'
  );
};

// Create Knex instance
const knexInstance: Knex = knex({
  client: 'postgresql',
  connection: getDatabaseUrl(),
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    directory: path.join(process.cwd(), 'src', 'database', 'migrations'),
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
  seeds: {
    directory: path.join(process.cwd(), 'src', 'database', 'seeds'),
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
});

// Test connection
knexInstance
  .raw('SELECT 1')
  .then(() => {
    logger.info('✓ Database connection established');
  })
  .catch((error: any) => {
    logger.error(`✗ Database connection failed: ${error.message}`);
  });

// Handle connection errors
knexInstance.on('error', (error: any) => {
  logger.error(`Database error: ${error.message}`);
});

export default knexInstance;