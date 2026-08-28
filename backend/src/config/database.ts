/**
 * PostgreSQL database configuration
 * Uses Knex for query building and migrations
 */

import pkg from 'knex';
import path from 'path';
import logger from '../utils/logger.js';

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

const isProd = process.env.NODE_ENV === 'production';

// Create Knex instance using default interop for CommonJS compatibility in NodeNext
const knexInstance = (pkg as any)({
  client: 'postgresql',
  connection: getDatabaseUrl(),
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    directory: isProd 
      ? path.join(process.cwd(), 'dist', 'database', 'migrations')
      : path.join(process.cwd(), 'src', 'database', 'migrations'),
    extension: isProd ? 'js' : 'ts',
    loadExtensions: ['.ts', '.js'],
  },
  seeds: {
    directory: isProd 
      ? path.join(process.cwd(), 'dist', 'database', 'seeds')
      : path.join(process.cwd(), 'src', 'database', 'seeds'),
    extension: isProd ? 'js' : 'ts',
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