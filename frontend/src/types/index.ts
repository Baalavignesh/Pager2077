// User Types
export interface User {
  id: string;
  hexCode: string;
  displayName: string | null;
  status: 'online' | 'offline';
}

// Friend Types
export interface Friend {
  id: string;
  hexCode: string;
  displayName: string | null;
  status: 'online' | 'offline';
  lastSeen?: string;
  friendshipId?: string;
}

// Friend Request Types
export interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    hexCode: string;
    displayName?: string | null;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Conversation Types
export interface Conversation {
  friendId: string;
  friendHexCode: string;
  friendDisplayName: string | null;
  unreadCount: number;
  lastMessage: {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
  } | null;
}

// Voice Note Types
export interface VoiceNote {
  id: string;
  senderId: string;
  recipientId: string;
  downloadUrl: string;
  durationSeconds: number;
  createdAt: string;
}

// Recording State
export interface RecordingState {
  isRecording: boolean;
  hasRecording: boolean;
  audioUri: string | null;
  durationSeconds: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Registration Response
export interface RegistrationResponse {
  userId: string;
  hexCode: string;
  token: string;
}

// Display Name Types
export interface DisplayNameMapping {
  [hexCode: string]: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface T9KeyMap {
  [key: string]: string[];
}

export interface T9InputState {
  input: string;
  currentKey: string | null;
  keyPressCount: number;
  lastKeyPressTime: number;
}
