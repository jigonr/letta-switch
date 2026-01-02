/**
 * Custom error classes for letta-switch
 */

export enum ErrorCode {
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  API_ERROR = 'API_ERROR',
  API_KEY_MISSING = 'API_KEY_MISSING',
  SECURITY_ERROR = 'SECURITY_ERROR',
}

export class LettaSwitchError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'LettaSwitchError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class SecurityError extends LettaSwitchError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.SECURITY_ERROR, details);
    this.name = 'SecurityError';
  }
}
