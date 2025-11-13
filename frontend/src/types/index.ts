// User Types
export interface User {
  id: string;
  hexCode: string;
  status: 'online' | 'offline';
}

// Friend Types
export interface Friend {
  id: string;
  hexCode: string;
  status: 'online' | 'offline';
  friendshipId: string;
}

// Friend Request Types
export interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    hexCode: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
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
