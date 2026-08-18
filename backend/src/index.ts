/**
 * Application entry point
 * Starts the Express server
 */

import createApp from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';
import FileService from './services/fileService.js';

const app = createApp();

let cleanupInterval: NodeJS.Timeout;

const server = app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Log Level: ${config.logLevel}`);
  
  // Clears any files left behind from previous sessions or crashes
  logger.info('🧹 Running initial temporary file cleanup...');  
  FileService.cleanupOldFiles().catch((err: any) => logger.error('Initial cleanup failed:', err));
  
  // Runs automatically every 1 hour (1000 ms * 60 sec * 60 min)
  const ONE_HOUR = 1000 * 60 * 60;
  cleanupInterval = setInterval(() => {
    logger.info('🧹 Running scheduled temporary file cleanup...');
    FileService.cleanupOldFiles().catch((err: any) => logger.error('Scheduled cleanup failed:', err));
  }, ONE_HOUR);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (cleanupInterval) clearInterval(cleanupInterval);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (cleanupInterval) clearInterval(cleanupInterval);
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