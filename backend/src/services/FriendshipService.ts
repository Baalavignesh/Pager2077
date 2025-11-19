/**
 * Friendship Service - Business logic for friend requests and friendships
 */
import { UserRepository } from '../repositories/UserRepository';
import { FriendshipRepository } from '../repositories/FriendshipRepository';
import type { FriendRequest, User } from '../models';
import { AppError } from '../utils/errors';

export class FriendshipService {
  constructor(
    private userRepo: UserRepository,
    private friendshipRepo: FriendshipRepository
  ) {}

  /**
   * Send a friend request
   */
  sendFriendRequest(fromUserId: string, toHexCode: string): FriendRequest {
    // Validate hex code format
    if (!/^[0-9A-Fa-f]{8}$/.test(toHexCode)) {
      throw new AppError(400, 'INVALID_HEX_CODE', 'Invalid hex code format');
    }

    // Get recipient user
    const toUser = this.userRepo.getUserByHexCode(toHexCode.toUpperCase());
    
    if (!toUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Check if trying to add self
    if (fromUserId === toUser.id) {
      throw new AppError(400, 'INVALID_INPUT', 'Cannot add yourself');
    }

    // Check if friendship already exists
    if (this.friendshipRepo.friendshipExists(fromUserId, toUser.id)) {
      throw new AppError(409, 'FRIENDSHIP_EXISTS', 'Already friends');
    }

    // Check if friend request already exists
    if (this.friendshipRepo.friendRequestExists(fromUserId, toUser.id)) {
      throw new AppError(409, 'DUPLICATE_REQUEST', 'Friend request already sent');
    }

    // Create friend request
    return this.friendshipRepo.createFriendRequest(fromUserId, toUser.id);
  }

  /**
   * Get pending friend requests for a user
   */
  getPendingRequests(userId: string): FriendRequest[] {
    return this.friendshipRepo.getPendingRequests(userId);
  }

  /**
   * Accept a friend request
   */
  acceptFriendRequest(requestId: string, userId: string): User {
    const request = this.friendshipRepo.getFriendRequestById(requestId);
    
    if (!request) {
      throw new AppError(404, 'NOT_FOUND', 'Friend request not found');
    }

    // Verify the request is for this user
    if (request.toUserId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Not authorized to accept this request');
    }

    // Verify request is still pending
    if (request.status !== 'pending') {
      throw new AppError(400, 'INVALID_INPUT', 'Request already processed');
    }

    // Update request status
    this.friendshipRepo.updateFriendRequestStatus(requestId, 'accepted');

    // Create friendship
    this.friendshipRepo.createFriendship(request.fromUserId, request.toUserId);

    // Return the friend's user info
    const friend = this.userRepo.getUserById(request.fromUserId);
    
    if (!friend) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Friend user not found');
    }

    return friend;
  }

  /**
   * Reject a friend request
   */
  rejectFriendRequest(requestId: string, userId: string): void {
    const request = this.friendshipRepo.getFriendRequestById(requestId);
    
    if (!request) {
      throw new AppError(404, 'NOT_FOUND', 'Friend request not found');
    }

    // Verify the request is for this user
    if (request.toUserId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Not authorized to reject this request');
    }

    // Verify request is still pending
    if (request.status !== 'pending') {
      throw new AppError(400, 'INVALID_INPUT', 'Request already processed');
    }

    // Update request status
    this.friendshipRepo.updateFriendRequestStatus(requestId, 'rejected');
  }

  /**
   * Get all friends for a user
   */
  getUserFriends(userId: string): User[] {
    return this.friendshipRepo.getUserFriends(userId);
  }

  /**
   * Remove a friend
   */
  removeFriend(userId: string, friendId: string): void {
    // Verify friendship exists
    if (!this.friendshipRepo.friendshipExists(userId, friendId)) {
      throw new AppError(404, 'NOT_FOUND', 'Friendship not found');
    }

    this.friendshipRepo.deleteFriendship(userId, friendId);
  }
}
