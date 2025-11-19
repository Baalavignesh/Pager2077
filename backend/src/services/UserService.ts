/**
 * User Service - Business logic for user operations
 */
import { UserRepository } from '../repositories/UserRepository';
import type { User, RegisterUserResponse } from '../models';
import { AppError } from '../utils/errors';
import { generateJWT } from '../utils/jwt';

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
}
