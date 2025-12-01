/**
 * APNS Provider - Manages Apple Push Notification connections
 * Using native http2 module for reliable APNS communication
 */
import http2 from 'http2';
import jwt from 'jsonwebtoken';
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

// Constants - increased timeouts for slower network connections
const CONNECTION_TIMEOUT = 30000;  // 30 seconds for initial connection
const REQUEST_TIMEOUT = 30000;     // 30 seconds per request

const ENDPOINTS = {
  development: 'https://api.sandbox.push.apple.com',
  production: 'https://api.push.apple.com'
};

// Invalid token status codes
const INVALID_TOKEN_STATUS_CODES = new Set([400, 410]);
const INVALID_TOKEN_REASONS = new Set([
  'BadDeviceToken',
  'Unregistered',
  'DeviceTokenNotForTopic'
]);


export class APNSProvider {
  private client: http2.ClientHttp2Session | null = null;
  private isProduction: boolean;
  private bundleId: string;
  private signingKey: string | null = null;
  private keyId: string | null = null;
  private teamId: string | null = null;
  private jwtToken: string | null = null;
  private jwtIssuedAt: number = 0;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.bundleId = process.env.APNS_BUNDLE_ID || 'com.pager2077.app';
  }

  initialize(): void {
    const keyPath = process.env.APNS_KEY_PATH;
    this.keyId = process.env.APNS_KEY_ID || null;
    this.teamId = process.env.APNS_TEAM_ID || null;
    console.log(keyPath)
    if (!keyPath || !this.keyId || !this.teamId) {
      console.warn('⚠️  APNS credentials not configured. Notifications will be mocked.');
      return;
    }

    try {
      this.signingKey = readFileSync(keyPath, 'utf8');
      console.log(`✅ APNS Provider initialized (${this.isProduction ? 'production' : 'sandbox'})`);
    } catch (error) {
      console.error('❌ Failed to read APNS key:', error);
      this.signingKey = null;
    }
  }

  private getJwtToken(): string {
    const now = Math.floor(Date.now() / 1000);
    
    // Refresh JWT if older than 50 minutes (Apple requires refresh within 1 hour)
    if (!this.jwtToken || now - this.jwtIssuedAt > 3000) {
      const claims = { iss: this.teamId, iat: now };
      this.jwtToken = jwt.sign(claims, this.signingKey!, {
        algorithm: 'ES256',
        keyid: this.keyId!,
      });
      this.jwtIssuedAt = now;
    }
    
    return this.jwtToken;
  }

  private async getClient(): Promise<http2.ClientHttp2Session> {
    if (this.client && !this.client.destroyed && !this.client.closed) {
      return this.client;
    }

    const endpoint = this.isProduction ? ENDPOINTS.production : ENDPOINTS.development;
    
    return new Promise((resolve, reject) => {
      const client = http2.connect(endpoint, {
        // Explicitly set ALPN protocol to h2 for Bun compatibility
        ALPNProtocols: ['h2'],
        settings: {
          enablePush: false,
          initialWindowSize: 65535,
          maxConcurrentStreams: 100,
        },
      });

      const timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Connection timeout'));
      }, CONNECTION_TIMEOUT);

      client.once('connect', () => {
        clearTimeout(timeout);
        this.client = client;
        console.log('✅ APNS HTTP/2 connection established');
        resolve(client);
      });

      client.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      client.on('error', (err) => {
        console.error('❌ APNS connection error:', err.message);
      });

      client.on('close', () => {
        console.log('📡 APNS connection closed');
        if (this.client === client) {
          this.client = null;
        }
      });

      client.on('goaway', () => {
        console.log('📡 APNS sent GOAWAY, reconnecting...');
        this.client = null;
      });
    });
  }


  private sendRequest(
    client: http2.ClientHttp2Session,
    deviceToken: string,
    payload: string,
    topic: string,
    pushType: 'alert' | 'background' | 'liveactivity' = 'alert',
    priority: number = 10
  ): Promise<{ success: boolean; statusCode: number; reason?: string }> {
    return new Promise((resolve, reject) => {
      if (!client || client.destroyed || client.closed) {
        return reject(new Error('Client disconnected'));
      }

      const jwtToken = this.getJwtToken();
      let statusCode: number | null = null;
      let responseBody = '';
      let completed = false;

      const request = client.request({
        ':method': 'POST',
        ':path': `/3/device/${deviceToken}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload),
        'authorization': `bearer ${jwtToken}`,
        'apns-topic': topic,
        'apns-push-type': pushType,
        'apns-priority': String(priority),
        'apns-expiration': '0',
      });

      const timeout = setTimeout(() => {
        if (!completed) {
          completed = true;
          try { request.close(http2.constants.NGHTTP2_CANCEL); } catch (e) {}
          reject(new Error('Request timeout'));
        }
      }, REQUEST_TIMEOUT);

      request.on('response', (headers) => {
        statusCode = headers[':status'] as number;
      });

      request.on('data', (chunk) => {
        responseBody += chunk;
      });

      request.on('error', (err) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeout);
          reject(err);
        }
      });

      request.on('end', () => {
        if (!completed) {
          completed = true;
          clearTimeout(timeout);
          
          const success = statusCode === 200;
          let reason: string | undefined;
          
          if (responseBody) {
            try {
              const parsed = JSON.parse(responseBody);
              reason = parsed.reason;
            } catch (e) {}
          }

          resolve({ success, statusCode: statusCode || 0, reason });
        }
      });

      request.write(payload);
      request.end();
    });
  }

  async sendAlertNotification(notification: APNSNotification): Promise<void> {
    if (!this.signingKey) {
      console.log('📱 [MOCK] Alert notification:', notification.deviceToken.substring(0, 10) + '...');
      return;
    }

    const payload = JSON.stringify({
      aps: {
        alert: notification.alert,
        sound: notification.alert?.sound || 'default',
        badge: notification.badge,
      },
      ...notification.data,
    });

    try {
      const client = await this.getClient();
      const result = await this.sendRequest(
        client,
        notification.deviceToken,
        payload,
        this.bundleId,
        'alert',
        10
      );

      if (!result.success) {
        console.log(notification)
        throw new Error(`APNS send failed: ${result.reason || `status ${result.statusCode}`}`);
      }

      console.log('✅ Alert notification sent:', notification.deviceToken.substring(0, 10) + '...');
    } catch (error: any) {
      console.error('❌ APNS error:', error.message);
      throw error;
    }
  }


  async sendSilentNotification(notification: APNSNotification): Promise<void> {
    if (!this.signingKey) {
      console.log('📱 [MOCK] Silent notification:', notification.deviceToken.substring(0, 10) + '...');
      return;
    }

    const payload = JSON.stringify({
      aps: {
        'content-available': 1,
      },
      ...notification.data,
    });

    try {
      const client = await this.getClient();
      const result = await this.sendRequest(
        client,
        notification.deviceToken,
        payload,
        this.bundleId,
        'background',
        5  // Lower priority for background
      );

      if (!result.success) {
        throw new Error(`APNS send failed: ${result.reason || `status ${result.statusCode}`}`);
      }

      console.log('✅ Silent notification sent:', notification.deviceToken.substring(0, 10) + '...');
    } catch (error: any) {
      console.error('❌ APNS error:', error.message);
      throw error;
    }
  }

  async sendLiveActivityNotification(notification: LiveActivityNotification): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[APNS PAYLOAD] Sending Live Activity push-to-start notification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Log token info (truncated for security)
    const truncatedToken = notification.pushToken.substring(0, 16) + '...' + notification.pushToken.substring(notification.pushToken.length - 8);
    console.log('[APNS PAYLOAD] Push-to-Start Token:', truncatedToken);
    console.log('[APNS PAYLOAD] Token Length:', notification.pushToken.length, 'characters');
    
    // APNS topic and push-type configuration
    const topic = `${this.bundleId}.push-type.liveactivity`;
    const pushType = 'liveactivity';
    const priority = 10;
    
    console.log('[APNS PAYLOAD] ─── APNS Configuration ───');
    console.log('[APNS PAYLOAD] Topic:', topic);
    console.log('[APNS PAYLOAD] Push-Type:', pushType);
    console.log('[APNS PAYLOAD] Priority:', priority, '(immediate delivery)');
    console.log('[APNS PAYLOAD] Environment:', this.isProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('[APNS PAYLOAD] Bundle ID:', this.bundleId);
    
    if (!this.signingKey) {
      console.log('[APNS PAYLOAD] ⚠️ MOCK MODE - APNS credentials not configured');
      console.log('[APNS PAYLOAD] Would send to token:', truncatedToken);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
    }

    const issueTime = Math.floor(Date.now() / 1000);
    
    // Construct the payload object
    const payloadObject = {
      aps: {
        timestamp: issueTime,
        event: 'start',
        'content-state': notification.contentState,
        alert: notification.alert || {
          title: notification.contentState.sender,
          body: notification.contentState.message,
        },
        sound: 'default',
      },
      'attributes-type': 'PagerActivityAttributes',
      attributes: {
        activityType: 'message',
      },
    };
    
    const payload = JSON.stringify(payloadObject);

    // Log full payload (with message truncated for readability)
    console.log('[APNS PAYLOAD] ─── Full Payload (JSON) ───');
    const loggablePayload = {
      aps: {
        timestamp: issueTime,
        event: 'start',
        'content-state': {
          ...notification.contentState,
          message: notification.contentState.message.length > 50 
            ? notification.contentState.message.substring(0, 50) + '...[truncated]' 
            : notification.contentState.message,
        },
        alert: payloadObject.aps.alert,
        sound: 'default',
      },
      'attributes-type': 'PagerActivityAttributes',
      attributes: { activityType: 'message' },
    };
    console.log('[APNS PAYLOAD]', JSON.stringify(loggablePayload, null, 2));
    console.log('[APNS PAYLOAD] Payload Size:', Buffer.byteLength(payload), 'bytes');
    
    // Log payload field verification (Requirements 4.1-4.5)
    console.log('[APNS PAYLOAD] ─── Payload Verification ───');
    console.log('[APNS PAYLOAD] ✓ aps.event:', payloadObject.aps.event, '(Req 4.1)');
    console.log('[APNS PAYLOAD] ✓ aps.content-state fields:', Object.keys(notification.contentState).join(', '), '(Req 4.2)');
    console.log('[APNS PAYLOAD] ✓ attributes-type:', payloadObject['attributes-type'], '(Req 4.3)');
    console.log('[APNS PAYLOAD] ✓ attributes:', JSON.stringify(payloadObject.attributes), '(Req 4.4)');
    console.log('[APNS PAYLOAD] ✓ aps.timestamp:', payloadObject.aps.timestamp, '(Req 4.5)');

    try {
      console.log('[APNS PAYLOAD] ─── Sending Request ───');
      console.log('[APNS PAYLOAD] Connecting to APNS...');
      const client = await this.getClient();
      
      console.log('[APNS PAYLOAD] Sending HTTP/2 POST to /3/device/' + truncatedToken);
      const result = await this.sendRequest(
        client,
        notification.pushToken,
        payload,
        topic,
        pushType,
        priority
      );

      console.log('[APNS PAYLOAD] ─── APNS Response ───');
      console.log('[APNS PAYLOAD] HTTP Status Code:', result.statusCode);
      console.log('[APNS PAYLOAD] Success:', result.success);
      if (result.reason) {
        console.log('[APNS PAYLOAD] Reason:', result.reason);
      }

      if (!result.success) {
        // Check if token is invalid
        if (INVALID_TOKEN_STATUS_CODES.has(result.statusCode) || 
            (result.reason && INVALID_TOKEN_REASONS.has(result.reason))) {
          console.error('[APNS PAYLOAD] ❌ Invalid Live Activity token detected');
          console.error('[APNS PAYLOAD] Error Code:', result.statusCode);
          console.error('[APNS PAYLOAD] Error Reason:', result.reason);
          console.error('[APNS PAYLOAD] Action: Token should be removed from database');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error(`Live Activity push failed: ${result.reason || `status ${result.statusCode}`}`);
      }

      console.log('[APNS PAYLOAD] ✅ Live Activity push-to-start sent successfully');
      console.log('[APNS PAYLOAD] iOS device should now display Live Activity on lock screen');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error: any) {
      console.error('[APNS PAYLOAD] ─── Error Details ───');
      console.error('[APNS PAYLOAD] Error Type:', error.name || 'Unknown');
      console.error('[APNS PAYLOAD] Error Message:', error.message);
      if (error.code) {
        console.error('[APNS PAYLOAD] Error Code:', error.code);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.client && !this.client.destroyed) {
      this.client.close();
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
