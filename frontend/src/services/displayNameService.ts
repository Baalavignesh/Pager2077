/**
 * Display Name Service - Validation and management of display names
 */
import { ValidationResult } from '../types';
import {
  saveDisplayName,
  getDisplayName,
  getAllDisplayNameMappings,
  saveAllDisplayNameMappings,
} from './storageService';

/**
 * Validate a display name against all rules
 * @returns { valid: boolean, error?: string }
 */
export function validateDisplayName(name: string): ValidationResult {
  // Check length (1-20 characters)
  if (name.length < 1 || name.length > 20) {
    return { valid: false, error: 'NAME MUST BE 1-20 CHARS' };
  }
  
  // Check whitespace-only
  if (name.trim().length === 0) {
    return { valid: false, error: 'NAME CANNOT BE EMPTY' };
  }
  
  // Check allowed characters (alphanumeric, space, hyphen, underscore)
  const allowedPattern = /^[a-zA-Z0-9 _-]+$/;
  if (!allowedPattern.test(name)) {
    return { valid: false, error: 'INVALID CHARACTERS' };
  }
  
  return { valid: true };
}

/**
 * Get display name for a hex code, with fallback to hex code
 */
export async function getDisplayNameForHexCode(hexCode: string): Promise<string> {
  const mappings = await getAllDisplayNameMappings();
  return mappings[hexCode] || hexCode;
}

/**
 * Get display names for multiple hex codes
 */
export async function getDisplayNamesForHexCodes(
  hexCodes: string[]
): Promise<Record<string, string>> {
  const mappings = await getAllDisplayNameMappings();
  const result: Record<string, string> = {};
  
  for (const hexCode of hexCodes) {
    result[hexCode] = mappings[hexCode] || hexCode;
  }
  
  return result;
}

/**
 * Set display name for a hex code
 */
export async function setDisplayNameForHexCode(
  hexCode: string,
  displayName: string
): Promise<void> {
  const validation = validateDisplayName(displayName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const mappings = await getAllDisplayNameMappings();
  mappings[hexCode] = displayName;
  await saveAllDisplayNameMappings(mappings);
}

/**
 * Get the current user's display name
 */
export async function getCurrentUserDisplayName(): Promise<string | null> {
  return await getDisplayName();
}

/**
 * Set the current user's display name
 */
export async function setCurrentUserDisplayName(
  hexCode: string,
  displayName: string
): Promise<void> {
  const validation = validateDisplayName(displayName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Save to Secure Storage
  await saveDisplayName(displayName);
  
  // Update mapping
  await setDisplayNameForHexCode(hexCode, displayName);
}
