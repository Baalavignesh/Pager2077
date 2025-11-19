/**
 * Custom error classes and error handling
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // User errors (400)
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_HEX_CODE: 'INVALID_HEX_CODE',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Conflict errors (409)
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  FRIENDSHIP_EXISTS: 'FRIENDSHIP_EXISTS',
  
  // Auth errors (401, 403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  VOICE_NOTE_EXPIRED: 'VOICE_NOTE_EXPIRED',
  
  // Server errors (500)
  DATABASE_ERROR: 'DATABASE_ERROR',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  NOTIFICATION_FAILED: 'NOTIFICATION_FAILED',
};
