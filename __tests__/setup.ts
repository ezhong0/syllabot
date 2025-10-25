/**
 * Vitest Setup File
 * Runs before all tests
 */

import { expect } from 'vitest';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// Global test utilities
global.console = {
  ...console,
  // Suppress console logs during tests unless debugging
  log: process.env.DEBUG ? console.log : () => {},
  debug: process.env.DEBUG ? console.debug : () => {},
  info: process.env.DEBUG ? console.info : () => {},
  // Keep errors and warnings
  error: console.error,
  warn: console.warn,
};
