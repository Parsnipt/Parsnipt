/**
 * Application entry point
 * Starts the Express server
 */

import createApp from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Log Level: ${config.logLevel}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

export default server;