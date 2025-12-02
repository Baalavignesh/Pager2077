/**
 * Data Models and TypeScript Interfaces
 */

export interface User {
  id: string;
  hexCode: string;
  deviceToken: string;
  displayName: string | null;
  liveActivityToken: string | null;
  status: 'online' | 'offline';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: Date;
}

export interface VoiceNote {
  id: string;
  senderId: string;
  recipientId: string;
  s3Key: string;
  durationSeconds: number;
  status: 'pending' | 'delivered' | 'played' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  playedAt?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  friendId: string;
  friendHexCode: string;
  friendDisplayName: string | null;
  lastMessage: Message | null;
  unreadCount: number;
}

// API Request/Response Types
export interface RegisterUserRequest {
  deviceToken: string;
}

export interface RegisterUserResponse {
  userId: string;
  hexCode: string;
  token: string;
}

export interface SendFriendRequestRequest {
  toHexCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Game Types
export type GameId = 'snake' | 'tetris';

// Leaderboard Models
export interface HighScore {
  userId: string;
  game: GameId;
  score: number;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string | null;
  hexCode: string;
  score: number;
  updatedAt: string;
}
