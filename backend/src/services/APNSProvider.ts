/**
 * APNS Provider - Manages Apple Push Notification connections
 * Inspired by Apollo Server architecture
 */
import apn from 'apn';

export interface APNSNotification {
  deviceToken: string;
  alert?: {
    title: string;
    body: string;
    sound?: string;
  };
  badge?: number;
  contentAvailable?: boolean; // For silent notifications
  data?: Record<string, any>;
}

export class APNSProvider {
  private provider: apn.Provider | null = null;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Initialize APNS provider with certificates
   */
  initialize(): void {
    const keyPath = process.env.APNS_KEY_PATH;
    const keyId = process.env.APNS_KEY_ID;
    const teamId = process.env.APNS_TEAM_ID;
    const bundleId = process.env.APNS_BUNDLE_ID || 'com.pager2077.app';

    if (!keyPath || !keyId || !teamId) {
      console.warn('⚠️  APNS credentials not configured. Notifications will be mocked.');
      return;
    }

    const options: apn.ProviderOptions = {
      token: {
        key: keyPath,
        keyId: keyId,
        teamId: teamId,
      },
      production: this.isProduction,
    };

    this.provider = new apn.Provider(options);
    console.log(`✅ APNS Provider initialized (${this.isProduction ? 'production' : 'development'})`);
  }

  /**
   * Send an alert notification (with sound and banner)
   */
  async sendAlertNotification(notification: APNSNotification): Promise<void> {
    if (!this.provider) {
      console.log('📱 [MOCK] Alert notification:', notification);
      return;
    }

    const note = new apn.Notification();
    
    if (notification.alert) {
      note.alert = notification.alert;
      note.sound = notification.alert.sound || 'default';
    }

    if (notification.badge !== undefined) {
      note.badge = notification.badge;
    }

    note.topic = process.env.APNS_BUNDLE_ID || 'com.pager2077.app';
    note.payload = notification.data || {};

    try {
      const result = await this.provider.send(note, notification.deviceToken);
      
      if (result.failed.length > 0) {
        console.error('❌ APNS send failed:', result.failed);
        throw new Error(`APNS send failed: ${result.failed[0].response?.reason}`);
      }

      console.log('✅ Alert notification sent:', notification.deviceToken.substring(0, 10) + '...');
    } catch (error) {
      console.error('❌ APNS error:', error);
      throw error;
    }
  }

  /**
   * Send a silent notification (background update, no alert)
   */
  async sendSilentNotification(notification: APNSNotification): Promise<void> {
    if (!this.provider) {
      console.log('📱 [MOCK] Silent notification:', notification);
      return;
    }

    const note = new apn.Notification();
    
    // Silent notification settings
    note.contentAvailable = true;
    note.pushType = 'background';
    note.priority = 5; // Lower priority for background updates
    note.topic = process.env.APNS_BUNDLE_ID || 'com.pager2077.app';
    note.payload = notification.data || {};

    try {
      const result = await this.provider.send(note, notification.deviceToken);
      
      if (result.failed.length > 0) {
        console.error('❌ APNS silent send failed:', result.failed);
        throw new Error(`APNS send failed: ${result.failed[0].response?.reason}`);
      }

      console.log('✅ Silent notification sent:', notification.deviceToken.substring(0, 10) + '...');
    } catch (error) {
      console.error('❌ APNS error:', error);
      throw error;
    }
  }

  /**
   * Shutdown APNS provider
   */
  async shutdown(): Promise<void> {
    if (this.provider) {
      await this.provider.shutdown();
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
