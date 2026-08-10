/**
 * Environment configuration
 * Centralizes all environment variable access
 */
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

interface Config {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: Config = {
  nodeEnv: getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  port: parseInt(getEnvVar('PORT', '5000'), 10),
  logLevel: getEnvVar('LOG_LEVEL', 'debug') as 'debug' | 'info' | 'warn' | 'error',
};

export default config;