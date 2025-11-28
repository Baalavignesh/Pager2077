/**
 * Message Validation and Sanitization Utilities
 */

// Valid characters: a-z, A-Z, 0-9, space, and basic punctuation (. , ! ? ' " -)
const VALID_CHAR_REGEX = /[a-zA-Z0-9 .,!?'"\-]/;

/**
 * Trim leading and trailing whitespace from message text
 */
export function trimMessage(text: string): string {
  return text.trim();
}

/**
 * Check if message is empty or contains only whitespace
 */
export function isEmptyMessage(text: string): boolean {
  return trimMessage(text).length === 0;
}

/**
 * Filter out invalid characters from message text
 * Keeps only: a-z, A-Z, 0-9, space, and basic punctuation (. , ! ? ' " -)
 */
export function filterInvalidCharacters(text: string): string {
  return text
    .split('')
    .filter((char) => VALID_CHAR_REGEX.test(char))
    .join('');
}

/**
 * Validate and sanitize message before sending
 * Returns sanitized message or null if invalid
 */
export function validateAndSanitizeMessage(text: string): string | null {
  // Trim whitespace
  const trimmed = trimMessage(text);
  
  // Check if empty
  if (isEmptyMessage(trimmed)) {
    return null;
  }
  
  // Filter invalid characters
  const sanitized = filterInvalidCharacters(trimmed);
  
  // Check if still has content after filtering
  if (sanitized.length === 0) {
    return null;
  }
  
  return sanitized;
}

/**
 * Check if message contains only valid characters
 */
export function hasOnlyValidCharacters(text: string): boolean {
  return text.split('').every((char) => VALID_CHAR_REGEX.test(char));
}
