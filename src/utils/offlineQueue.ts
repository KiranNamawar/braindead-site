// Offline queue for handling actions when offline

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export class OfflineQueue {
  private storageKey = 'braindead-offline-queue';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  async add(action: Omit<QueuedAction, 'id' | 'retryCount' | 'maxRetries'>): Promise<void> {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
      maxRetries: this.maxRetries,
    };

    const queue = await this.getQueue();
    queue.push(queuedAction);
    await this.saveQueue(queue);
  }

  async sync(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Still offline, skipping sync');
      return;
    }

    const queue = await this.getQueue();
    const processedIds: string[] = [];

    for (const action of queue) {
      try {
        await this.processAction(action);
        processedIds.push(action.id);
        console.log(`Successfully processed queued action: ${action.type}`);
      } catch (error) {
        console.warn(`Failed to process queued action: ${action.type}`, error);
        
        // Increment retry count
        action.retryCount++;
        
        if (action.retryCount >= action.maxRetries) {
          console.error(`Max retries reached for action: ${action.type}`);
          processedIds.push(action.id); // Remove from queue
        }
      }
    }

    // Remove processed actions from queue
    const remainingQueue = queue.filter(action => !processedIds.includes(action.id));
    await this.saveQueue(remainingQueue);
  }

  private async processAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'ANALYTICS_EVENT':
        await this.sendAnalyticsEvent(action.data);
        break;
      case 'USER_FEEDBACK':
        await this.sendUserFeedback(action.data);
        break;
      case 'TOOL_USAGE':
        await this.sendToolUsage(action.data);
        break;
      case 'ERROR_REPORT':
        await this.sendErrorReport(action.data);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async sendAnalyticsEvent(data: any): Promise<void> {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.status}`);
    }
  }

  private async sendUserFeedback(data: any): Promise<void> {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Feedback request failed: ${response.status}`);
    }
  }

  private async sendToolUsage(data: any): Promise<void> {
    const response = await fetch('/api/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Usage request failed: ${response.status}`);
    }
  }

  private async sendErrorReport(data: any): Promise<void> {
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error report failed: ${response.status}`);
    }
  }

  private async getQueue(): Promise<QueuedAction[]> {
    try {
      const queueData = localStorage.getItem(this.storageKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
      return [];
    }
  }

  private async saveQueue(queue: QueuedAction[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
      throw error;
    }
  }

  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  async clearQueue(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  async getQueueStatus(): Promise<{
    size: number;
    oldestAction: Date | null;
    actionTypes: Record<string, number>;
  }> {
    const queue = await this.getQueue();
    
    const actionTypes: Record<string, number> = {};
    let oldestTimestamp = Infinity;

    for (const action of queue) {
      actionTypes[action.type] = (actionTypes[action.type] || 0) + 1;
      oldestTimestamp = Math.min(oldestTimestamp, action.timestamp);
    }

    return {
      size: queue.length,
      oldestAction: oldestTimestamp === Infinity ? null : new Date(oldestTimestamp),
      actionTypes,
    };
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

// Auto-sync when coming back online
window.addEventListener('online', () => {
  offlineQueue.sync().catch(error => {
    console.error('Auto-sync failed:', error);
  });
});

// Periodic sync attempt (every 30 seconds when online)
setInterval(() => {
  if (navigator.onLine) {
    offlineQueue.sync().catch(error => {
      console.warn('Periodic sync failed:', error);
    });
  }
}, 30000);