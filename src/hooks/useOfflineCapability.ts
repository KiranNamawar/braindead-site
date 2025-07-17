// Hook for managing offline capabilities in tools
import { useState, useEffect, useCallback } from 'react';
import { offlineManager, isOnline, persistToolData, getPersistedToolData } from '../utils/offlineManager';

interface OfflineCapabilityOptions {
  toolId: string;
  autoSave?: boolean;
  saveInterval?: number;
  enableQueue?: boolean;
}

interface OfflineCapabilityState {
  isOnline: boolean;
  isOfflineCapable: boolean;
  offlineFeatures: string[];
  networkRequirements: string[];
  queueSize: number;
  lastSaved?: Date;
  autoSaveEnabled: boolean;
}

interface OfflineCapabilityActions {
  saveData: (data: any) => void;
  loadData: () => any | null;
  clearData: () => void;
  addToQueue: (type: string, data: any) => string;
  toggleAutoSave: () => void;
  forceSync: () => Promise<void>;
}

export function useOfflineCapability(
  options: OfflineCapabilityOptions
): [OfflineCapabilityState, OfflineCapabilityActions] {
  const { toolId, autoSave = true, saveInterval = 5000, enableQueue = true } = options;

  const [state, setState] = useState<OfflineCapabilityState>({
    isOnline: isOnline(),
    isOfflineCapable: offlineManager.isToolAvailableOffline(toolId),
    offlineFeatures: offlineManager.getToolOfflineFeatures(toolId),
    networkRequirements: offlineManager.getToolNetworkRequirements(toolId),
    queueSize: offlineManager.getOfflineQueueSize(),
    autoSaveEnabled: autoSave
  });

  const [autoSaveData, setAutoSaveData] = useState<any>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date>();

  // Update online status
  useEffect(() => {
    const handleOnlineChange = (online: boolean) => {
      setState(prev => ({ ...prev, isOnline: online }));
    };

    const handleQueueUpdate = () => {
      setState(prev => ({ ...prev, queueSize: offlineManager.getOfflineQueueSize() }));
    };

    offlineManager.on('online', () => handleOnlineChange(true));
    offlineManager.on('offline', () => handleOnlineChange(false));
    offlineManager.on('queue-item-processed', handleQueueUpdate);
    offlineManager.on('queue-item-failed', handleQueueUpdate);

    return () => {
      offlineManager.off('online', () => handleOnlineChange(true));
      offlineManager.off('offline', () => handleOnlineChange(false));
      offlineManager.off('queue-item-processed', handleQueueUpdate);
      offlineManager.off('queue-item-failed', handleQueueUpdate);
    };
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!state.autoSaveEnabled || !autoSaveData) {
      return;
    }

    const timer = setTimeout(() => {
      saveData(autoSaveData);
    }, saveInterval);

    return () => clearTimeout(timer);
  }, [autoSaveData, state.autoSaveEnabled, saveInterval]);

  // Actions
  const saveData = useCallback((data: any) => {
    try {
      persistToolData(toolId, data);
      setLastSaveTime(new Date());
      setState(prev => ({ ...prev, lastSaved: new Date() }));
      
      // If offline and queue enabled, add to queue for later sync
      if (!state.isOnline && enableQueue) {
        offlineManager.addToOfflineQueue('tool-data', {
          toolId,
          data,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.warn(`Failed to save data for tool ${toolId}:`, error);
    }
  }, [toolId, state.isOnline, enableQueue]);

  const loadData = useCallback(() => {
    try {
      return getPersistedToolData(toolId);
    } catch (error) {
      console.warn(`Failed to load data for tool ${toolId}:`, error);
      return null;
    }
  }, [toolId]);

  const clearData = useCallback(() => {
    try {
      offlineManager.clearPersistedToolData(toolId);
      setAutoSaveData(null);
      setLastSaveTime(undefined);
      setState(prev => ({ ...prev, lastSaved: undefined }));
    } catch (error) {
      console.warn(`Failed to clear data for tool ${toolId}:`, error);
    }
  }, [toolId]);

  const addToQueue = useCallback((type: string, data: any) => {
    if (!enableQueue) {
      throw new Error('Queue is not enabled for this tool');
    }
    
    return offlineManager.addToOfflineQueue('tool-data', {
      toolId,
      type,
      data,
      timestamp: new Date()
    });
  }, [toolId, enableQueue]);

  const toggleAutoSave = useCallback(() => {
    setState(prev => ({ ...prev, autoSaveEnabled: !prev.autoSaveEnabled }));
  }, []);

  const forceSync = useCallback(async () => {
    if (!state.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    // This would typically trigger a manual sync
    // For now, it's a no-op since we're privacy-focused and local-only
    return Promise.resolve();
  }, [state.isOnline]);

  // Auto-save trigger function for components to use
  const triggerAutoSave = useCallback((data: any) => {
    if (state.autoSaveEnabled) {
      setAutoSaveData(data);
    }
  }, [state.autoSaveEnabled]);

  const actions: OfflineCapabilityActions = {
    saveData,
    loadData,
    clearData,
    addToQueue,
    toggleAutoSave,
    forceSync
  };

  return [state, { ...actions, triggerAutoSave }];
}

// Specialized hook for tools that need real-time data persistence
export function useOfflineStorage<T>(
  toolId: string,
  initialData: T,
  options: { autoSave?: boolean; saveInterval?: number } = {}
): [T, (data: T) => void, { isOnline: boolean; lastSaved?: Date; clearData: () => void }] {
  const [offlineState, offlineActions] = useOfflineCapability({
    toolId,
    ...options
  });

  const [data, setData] = useState<T>(() => {
    const saved = offlineActions.loadData();
    return saved !== null ? saved : initialData;
  });

  const updateData = useCallback((newData: T) => {
    setData(newData);
    if (options.autoSave !== false) {
      offlineActions.triggerAutoSave(newData);
    }
  }, [offlineActions, options.autoSave]);

  const clearData = useCallback(() => {
    setData(initialData);
    offlineActions.clearData();
  }, [initialData, offlineActions]);

  return [
    data,
    updateData,
    {
      isOnline: offlineState.isOnline,
      lastSaved: offlineState.lastSaved,
      clearData
    }
  ];
}

// Hook for tools that need to show offline capability status
export function useOfflineStatus(toolId: string) {
  const [state] = useOfflineCapability({ toolId, autoSave: false, enableQueue: false });
  
  return {
    isOnline: state.isOnline,
    isOfflineCapable: state.isOfflineCapable,
    offlineFeatures: state.offlineFeatures,
    networkRequirements: state.networkRequirements,
    canWorkOffline: state.offlineFeatures.length > 0,
    limitedOffline: state.networkRequirements.length > 0
  };
}