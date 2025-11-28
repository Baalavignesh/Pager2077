/**
 * Error Message Mapping
 * Maps backend error codes to user-friendly messages
 */

export const ERROR_MESSAGES: Record<string, string> = {
  'NETWORK_ERROR': 'NETWORK ERROR',
  'TIMEOUT': 'SEND TIMEOUT',
  'SERVER_ERROR': 'SERVER ERROR',
  'INVALID_RECIPIENT': 'FRIEND NOT FOUND',
  'MESSAGE_TOO_LONG': 'MESSAGE TOO LONG',
  'RATE_LIMIT': 'TOO MANY MESSAGES',
  'UNAUTHORIZED': 'NOT AUTHORIZED',
  'UNKNOWN': 'SEND FAILED',
};

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['UNKNOWN'];
}

/**
 * Map API error to error code
 */
export function mapApiError(error: any): string {
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message === 'TIMEOUT') {
      return 'TIMEOUT';
    }
    if (error.message === 'NETWORK_ERROR') {
      return 'NETWORK_ERROR';
    }
    if (error.message.includes('not found')) {
      return 'INVALID_RECIPIENT';
    }
    if (error.message.includes('too long')) {
      return 'MESSAGE_TOO_LONG';
    }
    if (error.message.includes('rate limit')) {
      return 'RATE_LIMIT';
    }
    if (error.message.includes('unauthorized') || error.message.includes('not authorized')) {
      return 'UNAUTHORIZED';
    }
  }
  
  return 'UNKNOWN';
}
