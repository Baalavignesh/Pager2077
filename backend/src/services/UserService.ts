/**
 * User Service - Business logic for user operations
 */
import { UserRepository } from '../repositories/UserRepository';
import type { User, RegisterUserResponse } from '../models';
import { AppError } from '../utils/errors';
import { generateJWT } from '../utils/jwt';

// Display name validation constants
const DISPLAY_NAME_MIN_LENGTH = 1;
const DISPLAY_NAME_MAX_LENGTH = 20;
// Valid characters: alphanumeric, spaces, hyphens, underscores
const DISPLAY_NAME_PATTERN = /^[a-zA-Z0-9\s\-_]+$/;

export class UserService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Register a new user
   */
  registerUser(deviceToken: string): RegisterUserResponse {
    // Check if user already exists with this device token
    const existingUser = this.userRepo.getUserByDeviceToken(deviceToken);
    
    if (existingUser) {
      // Return existing user
      const token = generateJWT(existingUser.id, existingUser.hexCode);
      return {
        userId: existingUser.id,
        hexCode: existingUser.hexCode,
        token,
      };
    }

    // Create new user
    const user = this.userRepo.createUser(deviceToken);
    const token = generateJWT(user.id, user.hexCode);

    return {
      userId: user.id,
      hexCode: user.hexCode,
      token,
    };
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User {
    const user = this.userRepo.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  /**
   * Get user by hex code
   */
  getUserByHexCode(hexCode: string): User | null {
    return this.userRepo.getUserByHexCode(hexCode);
  }

  /**
   * Update user status
   */
  updateUserStatus(userId: string, status: 'online' | 'offline'): void {
    const user = this.userRepo.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    this.userRepo.updateUserStatus(userId, status);
  }

  /**
   * Get user's friends
   */
  getUserFriends(userId: string): User[] {
    const user = this.userRepo.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // This will be implemented via FriendshipRepository
    return [];
  }

  /**
   * Validate display name format
   * @param displayName - The display name to validate
   * @returns true if valid, throws AppError if invalid
   */
  private validateDisplayName(displayName: string): boolean {
    // Check for empty or whitespace-only
    const trimmed = displayName.trim();
    if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
      throw new AppError(400, 'INVALID_DISPLAY_NAME', 'Display name cannot be empty');
    }

    // Check length
    if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
      throw new AppError(400, 'INVALID_DISPLAY_NAME', `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less`);
    }

    // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
    if (!DISPLAY_NAME_PATTERN.test(trimmed)) {
      throw new AppError(400, 'INVALID_DISPLAY_NAME', 'Display name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    return true;
  }

  /**
   * Update user's display name
   */
  updateDisplayName(userId: string, displayName: string): User {
    const user = this.userRepo.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Validate display name
    this.validateDisplayName(displayName);

    // Update in database
    this.userRepo.updateDisplayName(userId, displayName.trim());

    // Return updated user
    return this.userRepo.getUserById(userId)!;
  }

  /**
   * Update user's Live Activity token
   */
  updateLiveActivityToken(userId: string, liveActivityToken: string | null): void {
    const user = this.userRepo.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    this.userRepo.updateLiveActivityToken(userId, liveActivityToken);
  }

  /**
   * Get user's Live Activity token
   */
  getLiveActivityToken(userId: string): string | null {
    const user = this.userRepo.getUserById(userId);
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return this.userRepo.getLiveActivityToken(userId);
  }
}
