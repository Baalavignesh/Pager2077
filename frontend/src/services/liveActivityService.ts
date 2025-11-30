/**
 * Live Activity Service
 * 
 * TypeScript wrapper for the native LiveActivityBridge module.
 * Provides a clean API for starting, updating, and ending iOS Live Activities.
 * 
 * Note: Live Activities are iOS 16.1+ only. On Android/web, these functions
 * are no-ops that return graceful failures.
 */

import { NativeModules, Platform } from 'react-native';

// Get the native module (will be undefined on non-iOS platforms)
const { LiveActivityBridge } = NativeModules;

// MARK: - Types

export interface LiveActivityContent {
  /** Sender identifier (6-digit friend code or display name) */
  sender: string;
  /** Message preview (will be truncated to 100 chars) */
  message: string;
  /** Unix timestamp in milliseconds (defaults to now) */
  timestamp?: number;
  /** Whether this is a demo/test activity */
  isDemo?: boolean;
  /** Current message index (1-based) */
  messageIndex?: number;
  /** Total number of messages */
  totalMessages?: number;
}

export interface LiveActivityResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Unique identifier for the activity (on success) */
  activityId?: string;
  /** Error message (on failure) */
  error?: string;
}

// MARK: - Service Functions

/**
 * Check if Live Activities are supported and enabled on this device.
 * Returns false on Android/web or iOS < 16.1.
 */
export async function areActivitiesEnabled(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !LiveActivityBridge) {
    return false;
  }
  
  try {
    return await LiveActivityBridge.areActivitiesEnabled();
  } catch (error) {
    console.warn('[LiveActivity] Failed to check if activities are enabled:', error);
    return false;
  }
}

/**
 * Start a new Live Activity with the given content.
 * 
 * @param content - The content to display in the Live Activity
 * @returns Result with success status and activityId or error
 */
export async function startActivity(content: LiveActivityContent): Promise<LiveActivityResult> {
  if (Platform.OS !== 'ios' || !LiveActivityBridge) {
    return {
      success: false,
      error: 'Live Activities are only supported on iOS',
    };
  }
  
  // Validate content
  if (!content.sender || content.sender.trim() === '') {
    return {
      success: false,
      error: 'Sender is required',
    };
  }
  
  if (!content.message || content.message.trim() === '') {
    return {
      success: false,
      error: 'Message is required',
    };
  }
  
  try {
    const result = await LiveActivityBridge.startActivity({
      sender: content.sender,
      message: content.message,
      timestamp: content.timestamp ?? Date.now(),
      isDemo: content.isDemo ?? false,
      messageIndex: content.messageIndex ?? 1,
      totalMessages: content.totalMessages ?? 1,
    });
    
    console.log('[LiveActivity] Start result:', result);
    return result;
  } catch (error) {
    console.error('[LiveActivity] Failed to start activity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing Live Activity with new content.
 * 
 * @param activityId - The ID of the activity to update
 * @param content - The new content to display
 * @returns Result with success status or error
 */
export async function updateActivity(
  activityId: string,
  content: LiveActivityContent
): Promise<LiveActivityResult> {
  if (Platform.OS !== 'ios' || !LiveActivityBridge) {
    return {
      success: false,
      error: 'Live Activities are only supported on iOS',
    };
  }
  
  if (!activityId) {
    return {
      success: false,
      error: 'Activity ID is required',
    };
  }
  
  try {
    const result = await LiveActivityBridge.updateActivity(activityId, {
      sender: content.sender,
      message: content.message,
      timestamp: content.timestamp ?? Date.now(),
      isDemo: content.isDemo ?? false,
      messageIndex: content.messageIndex ?? 1,
      totalMessages: content.totalMessages ?? 1,
    });
    
    console.log('[LiveActivity] Update result:', result);
    return result;
  } catch (error) {
    console.error('[LiveActivity] Failed to update activity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * End a Live Activity and remove it from the lock screen.
 * 
 * @param activityId - The ID of the activity to end
 * @returns Result with success status or error
 */
export async function endActivity(activityId: string): Promise<LiveActivityResult> {
  if (Platform.OS !== 'ios' || !LiveActivityBridge) {
    return {
      success: false,
      error: 'Live Activities are only supported on iOS',
    };
  }
  
  if (!activityId) {
    return {
      success: false,
      error: 'Activity ID is required',
    };
  }
  
  try {
    const result = await LiveActivityBridge.endActivity(activityId);
    console.log('[LiveActivity] End result:', result);
    return result;
  } catch (error) {
    console.error('[LiveActivity] Failed to end activity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * End all active Live Activities.
 * 
 * @returns Result with success status or error
 */
export async function endAllActivities(): Promise<LiveActivityResult> {
  if (Platform.OS !== 'ios' || !LiveActivityBridge) {
    return {
      success: false,
      error: 'Live Activities are only supported on iOS',
    };
  }
  
  try {
    const result = await LiveActivityBridge.endAllActivities();
    console.log('[LiveActivity] End all result:', result);
    return result;
  } catch (error) {
    console.error('[LiveActivity] Failed to end all activities:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the ID of the current active Live Activity, if any.
 * 
 * @returns The activity ID or null if no activity is active
 */
export async function getCurrentActivityId(): Promise<string | null> {
  if (Platform.OS !== 'ios' || !LiveActivityBridge) {
    return null;
  }
  
  try {
    return await LiveActivityBridge.getCurrentActivityId();
  } catch (error) {
    console.error('[LiveActivity] Failed to get current activity ID:', error);
    return null;
  }
}

// MARK: - Demo/Testing Helpers

// Demo messages for testing
const DEMO_MESSAGES = [
  'MAJOR UPDATE: NEW VOICE MESSAGE RECEIVED',
  'REMINDER: CHECK YOUR INBOX FOR URGENT MSG',
  'ALERT: FRIEND REQUEST FROM 123456',
  'NOTICE: YOUR MESSAGE WAS DELIVERED',
  'INFO: 3 NEW MESSAGES WAITING',
];

/**
 * Start a demo Live Activity for testing purposes.
 * Uses placeholder content with "DEMO" sender.
 */
export async function startDemoActivity(): Promise<LiveActivityResult> {
  return startActivity({
    sender: 'DEMO',
    message: DEMO_MESSAGES[0],
    isDemo: true,
    messageIndex: 1,
    totalMessages: DEMO_MESSAGES.length,
  });
}

/**
 * Update the demo activity with a new message by index.
 */
export async function updateDemoActivity(
  activityId: string,
  messageIndex: number
): Promise<LiveActivityResult> {
  const index = Math.max(0, Math.min(messageIndex - 1, DEMO_MESSAGES.length - 1));
  return updateActivity(activityId, {
    sender: 'DEMO',
    message: DEMO_MESSAGES[index],
    isDemo: true,
    messageIndex: index + 1,
    totalMessages: DEMO_MESSAGES.length,
  });
}
