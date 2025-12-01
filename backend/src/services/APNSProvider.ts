/**
 * APNS Provider - Manages Apple Push Notification connections
 * Using apns2 library for reliable APNS communication
 */
import { ApnsClient, Notification, Priority, PushType } from 'apns2';
import { readFileSync } from 'fs';

export interface APNSNotification {
  deviceToken: string;
  alert?: {
    title: string;
    body: string;
    sound?: string;
  };
  badge?: number;
  contentAvailable?: boolean;
  data?: Record<string, any>;
}

export interface LiveActivityNotification {
  pushToken: string;
  contentState: {
    sender: string;
    message: string;
    timestamp: number;  // Unix timestamp in seconds (for Swift Date decoding)
    isDemo: boolean;
    messageIndex: number;
    totalMessages: number;
  };
  alert?: {
    title: string;
    body: string;
    sound?: string;
  };
}

// Invalid token status codes
const INVALID_TOKEN_REASONS = new Set([
  'BadDeviceToken',
  'Unregistered',
  'DeviceTokenNotForTopic'
]);

export class APNSProvider {
  private client: ApnsClient | null = null;
  private isProduction: boolean;
  private bundleId: string;
  private signingKey: string | null = null;
  private keyId: string | null = null;
  private teamId: string | null = null;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.bundleId = process.env.APNS_BUNDLE_ID || 'com.pager2077.app';
  }

  initialize(): void {
    const keyPath = process.env.APNS_KEY_PATH;
    this.keyId = process.env.APNS_KEY_ID || null;
    this.teamId = process.env.APNS_TEAM_ID || null;

    if (!keyPath || !this.keyId || !this.teamId) {
      console.warn('⚠️  APNS credentials not configured. Notifications will be mocked.');
      return;
    }

    try {
      this.signingKey = readFileSync(keyPath, 'utf8');
      
      // Create APNS client with apns2 library
      this.client = new ApnsClient({
        team: this.teamId,
        keyId: this.keyId,
        signingKey: this.signingKey,
        defaultTopic: this.bundleId,
        host: this.isProduction 
          ? 'api.push.apple.com' 
          : 'api.sandbox.push.apple.com',
        requestTimeout: 30000,  // 30 second timeout
        keepAlive: true,
      });

      console.log(`✅ APNS Provider initialized (${this.isProduction ? 'production' : 'sandbox'})`);
    } catch (error) {
      console.error('❌ Failed to initialize APNS:', error);
      this.signingKey = null;
    }
  }

  async sendAlertNotification(notification: APNSNotification): Promise<void> {
    if (!this.client || !this.signingKey) {
      console.log('📱 [MOCK] Alert notification:', notification.deviceToken.substring(0, 10) + '...');
      return;
    }

    // Skip simulator tokens - they will never work with APNS
    if (notification.deviceToken.startsWith('simulator-')) {
      console.log('📱 [SKIP] Simulator token detected, skipping APNS:', notification.deviceToken.substring(0, 20) + '...');
      return;
    }

    try {
      const apnsNotification = new Notification(notification.deviceToken, {
        type: PushType.alert,
        topic: this.bundleId,
        priority: Priority.immediate,
        alert: notification.alert,
        sound: notification.alert?.sound || 'default',
        badge: notification.badge,
        data: notification.data,
      });

      await this.client.send(apnsNotification);
      console.log('✅ Alert notification sent:', notification.deviceToken.substring(0, 10) + '...');
    } catch (error: any) {
      console.error('❌ APNS error:', error.message || error);
      console.log('Notification details:', notification);
      throw error;
    }
  }

  async sendSilentNotification(notification: APNSNotification): Promise<void> {
    if (!this.client || !this.signingKey) {
      console.log('📱 [MOCK] Silent notification:', notification.deviceToken.substring(0, 10) + '...');
      return;
    }

    // Skip simulator tokens - they will never work with APNS
    if (notification.deviceToken.startsWith('simulator-')) {
      console.log('📱 [SKIP] Simulator token detected, skipping APNS:', notification.deviceToken.substring(0, 20) + '...');
      return;
    }

    try {
      const apnsNotification = new Notification(notification.deviceToken, {
        type: PushType.background,
        topic: this.bundleId,
        priority: Priority.throttled,
        contentAvailable: true,
        data: notification.data,
      });

      await this.client.send(apnsNotification);
      console.log('✅ Silent notification sent:', notification.deviceToken.substring(0, 10) + '...');
    } catch (error: any) {
      console.error('❌ APNS error:', error.message || error);
      throw error;
    }
  }

  async sendLiveActivityNotification(notification: LiveActivityNotification): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[APNS] Sending Live Activity push-to-start notification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const truncatedToken = notification.pushToken.substring(0, 16) + '...' + notification.pushToken.substring(notification.pushToken.length - 8);
    console.log('[APNS] Push-to-Start Token:', truncatedToken);
    
    // IMPORTANT: Live Activity topic format
    const liveActivityTopic = `${this.bundleId}.push-type.liveactivity`;
    console.log('[APNS] Topic:', liveActivityTopic);
    console.log('[APNS] Environment:', this.isProduction ? 'PRODUCTION' : 'SANDBOX');

    if (!this.client || !this.signingKey) {
      console.log('[APNS] ⚠️ MOCK MODE - APNS credentials not configured');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build the Live Activity payload
    // For push-to-start, ALL fields must be inside the 'aps' object:
    // - timestamp: Unix timestamp
    // - event: "start"
    // - content-state: The ContentState matching Swift struct
    // - attributes-type: The name of your ActivityAttributes struct (inside aps!)
    // - attributes: Static attributes for the activity (inside aps!)
    const payload = {
      aps: {
        'timestamp': timestamp,
        'event': 'start',
        'content-state': notification.contentState,
        'attributes-type': 'PagerActivityAttributes',
        'attributes': {
          activityType: 'message',
        },
        'alert': notification.alert || {
          title: notification.contentState.sender,
          body: notification.contentState.message,
        },
        'sound': 'default',
      },
    };

    console.log('[APNS] Payload:', JSON.stringify(payload, null, 2));

    try {
      // Create notification with Live Activity options set in constructor
      // For push-to-start, the entire payload goes in 'aps'
      const apnsNotification = new Notification(notification.pushToken, {
        type: PushType.liveactivity,
        topic: liveActivityTopic,
        priority: Priority.immediate,
        aps: payload.aps,
      });

      console.log('[APNS] Sending to APNS...');
      await this.client.send(apnsNotification);
      
      console.log('[APNS] ✅ Live Activity push-to-start sent successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error: any) {
      console.error('[APNS] ─── Error Details ───');
      console.error('[APNS] Error:', error.message || error);
      
      // Check if it's an invalid token error
      if (error.reason && INVALID_TOKEN_REASONS.has(error.reason)) {
        console.error('[APNS] ❌ Invalid Live Activity token - should be removed from database');
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      // apns2 client doesn't have a close method, connections are managed automatically
      this.client = null;
      console.log('APNS Provider shutdown');
    }
  }
}

// Singleton instance
let apnsProvider: APNSProvider | null = null;

export function getAPNSProvider(): APNSProvider {
  if (!apnsProvider) {
    apnsProvider = new APNSProvider();
    apnsProvider.initialize();
  }
  return apnsProvider;
}
