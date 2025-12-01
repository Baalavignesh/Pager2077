/**
 * Notification Queue - BullMQ queue for processing notifications
 * Inspired by Apollo Server's queue architecture
 */
import { Queue, Worker, Job } from 'bullmq';
import { getRedis } from './redis';
import { getAPNSProvider } from '../services/APNSProvider';
import type { APNSNotification, LiveActivityNotification } from '../services/APNSProvider';

export interface NotificationJob {
  type: 'alert' | 'silent' | 'liveactivity';
  notification: APNSNotification;
  liveActivityNotification?: LiveActivityNotification;
  userId: string;
  retryCount?: number;
}

let notificationQueue: Queue<NotificationJob> | null = null;
let notificationWorker: Worker<NotificationJob> | null = null;

/**
 * Initialize notification queue
 */
export function initNotificationQueue(): Queue<NotificationJob> {
  if (notificationQueue) {
    return notificationQueue;
  }

  const redis = getRedis();

  notificationQueue = new Queue<NotificationJob>('notifications', {
    connection: redis,
    defaultJobOptions: {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2 seconds
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    },
  });

  console.log('✅ Notification queue initialized');

  return notificationQueue;
}

/**
 * Start notification worker to process jobs
 */
export function startNotificationWorker(): Worker<NotificationJob> {
  if (notificationWorker) {
    return notificationWorker;
  }

  const redis = getRedis();
  const apnsProvider = getAPNSProvider();

  notificationWorker = new Worker<NotificationJob>(
    'notifications',
    async (job: Job<NotificationJob>) => {
      const { type, notification, liveActivityNotification, userId } = job.data;

      console.log(`📤 Processing ${type} notification for user ${userId}`);

      try {
        if (type === 'alert') {
          await apnsProvider.sendAlertNotification(notification);
        } else if (type === 'silent') {
          await apnsProvider.sendSilentNotification(notification);
        } else if (type === 'liveactivity' && liveActivityNotification) {
          // Log Live Activity token flow details
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('[LA TOKEN FLOW] Processing Live Activity notification from queue');
          console.log('[LA TOKEN FLOW] Job ID:', job.id);
          console.log('[LA TOKEN FLOW] User ID:', userId);
          console.log('[LA TOKEN FLOW] Push Token (preview):', liveActivityNotification.pushToken.substring(0, 32) + '...');
          console.log('[LA TOKEN FLOW] Content State:', JSON.stringify(liveActivityNotification.contentState, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          await apnsProvider.sendLiveActivityNotification(liveActivityNotification);
        }

        console.log(`✅ Notification sent successfully (job ${job.id})`);
      } catch (error) {
        console.error(`❌ Notification failed (job ${job.id}):`, error);
        throw error; // Will trigger retry
      }
    },
    {
      connection: redis,
      concurrency: 10, // Process up to 10 notifications concurrently
      limiter: {
        max: 100, // Max 100 jobs
        duration: 1000, // Per second (rate limiting)
      },
    }
  );

  // Event listeners
  notificationWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  notificationWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  notificationWorker.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });

  console.log('✅ Notification worker started');

  return notificationWorker;
}

/**
 * Add a notification job to the queue
 */
export async function queueNotification(job: NotificationJob): Promise<void> {
  const queue = notificationQueue || initNotificationQueue();

  await queue.add('notification', job, {
    priority: job.type === 'alert' ? 1 : 2, // Alert notifications have higher priority
  });

  console.log(`📥 Queued ${job.type} notification for user ${job.userId}`);
}

/**
 * Shutdown queue and worker
 */
export async function shutdownNotificationQueue(): Promise<void> {
  if (notificationWorker) {
    await notificationWorker.close();
    notificationWorker = null;
    console.log('Notification worker closed');
  }

  if (notificationQueue) {
    await notificationQueue.close();
    notificationQueue = null;
    console.log('Notification queue closed');
  }
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics() {
  if (!notificationQueue) {
    return null;
  }

  const [waiting, active, completed, failed] = await Promise.all([
    notificationQueue.getWaitingCount(),
    notificationQueue.getActiveCount(),
    notificationQueue.getCompletedCount(),
    notificationQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
  };
}
