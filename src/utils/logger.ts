/**
 * Logging utilities with chalk for colored output
 */

import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.warn(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.error(chalk.red('✖'), msg),
  debug: (msg: string) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('→'), msg);
    }
  },
};

/**
 * Redact API keys from strings for safe logging
 */
export function redactApiKey(str: string): string {
  return str.replace(/at-let-[a-zA-Z0-9]{64}/g, 'at-let-***REDACTED***');
}
