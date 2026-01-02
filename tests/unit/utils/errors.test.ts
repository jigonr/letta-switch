/**
 * Tests for custom error classes
 */

import { describe, it, expect } from 'vitest';
import { ErrorCode, LettaSwitchError, SecurityError } from '../../../src/utils/errors.js';

describe('ErrorCode', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCode.CONFIG_NOT_FOUND).toBe('CONFIG_NOT_FOUND');
    expect(ErrorCode.INVALID_CONFIG).toBe('INVALID_CONFIG');
    expect(ErrorCode.AGENT_NOT_FOUND).toBe('AGENT_NOT_FOUND');
    expect(ErrorCode.PROFILE_NOT_FOUND).toBe('PROFILE_NOT_FOUND');
    expect(ErrorCode.API_ERROR).toBe('API_ERROR');
    expect(ErrorCode.API_KEY_MISSING).toBe('API_KEY_MISSING');
    expect(ErrorCode.SECURITY_ERROR).toBe('SECURITY_ERROR');
  });
});

describe('LettaSwitchError', () => {
  it('should create error with message and code', () => {
    const error = new LettaSwitchError('Test error', ErrorCode.CONFIG_NOT_FOUND);

    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.CONFIG_NOT_FOUND);
    expect(error.name).toBe('LettaSwitchError');
    expect(error.details).toBeUndefined();
  });

  it('should include details when provided', () => {
    const details = { path: '/some/path', reason: 'file not found' };
    const error = new LettaSwitchError('Test error', ErrorCode.API_ERROR, details);

    expect(error.details).toEqual(details);
  });

  it('should be an instance of Error', () => {
    const error = new LettaSwitchError('Test', ErrorCode.INVALID_CONFIG);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(LettaSwitchError);
  });

  it('should have a stack trace', () => {
    const error = new LettaSwitchError('Test', ErrorCode.API_ERROR);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('LettaSwitchError');
  });

  it('should work with try/catch', () => {
    const throwError = () => {
      throw new LettaSwitchError('Thrown error', ErrorCode.PROFILE_NOT_FOUND);
    };

    expect(throwError).toThrow(LettaSwitchError);
    expect(throwError).toThrow('Thrown error');
  });
});

describe('SecurityError', () => {
  it('should create security error with message', () => {
    const error = new SecurityError('Path traversal detected');

    expect(error.message).toBe('Path traversal detected');
    expect(error.code).toBe(ErrorCode.SECURITY_ERROR);
    expect(error.name).toBe('SecurityError');
  });

  it('should include details when provided', () => {
    const details = { attemptedPath: '../../../etc/passwd' };
    const error = new SecurityError('Path traversal', details);

    expect(error.details).toEqual(details);
  });

  it('should be an instance of LettaSwitchError', () => {
    const error = new SecurityError('Test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(LettaSwitchError);
    expect(error).toBeInstanceOf(SecurityError);
  });
});
