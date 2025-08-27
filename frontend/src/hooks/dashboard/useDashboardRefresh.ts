import { useState, useCallback, useRef, useEffect } from 'react';

export interface RefreshStatus {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refreshCount: number;
}

export interface RefreshOptions {
  showNotification?: boolean;
  section?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseDashboardRefreshReturn {
  refreshStatus: RefreshStatus;
  refresh: (refreshFn: () => Promise<void>, options?: RefreshOptions) => Promise<void>;
  refreshMultiple: (
    refreshFns: Array<{
      fn: () => Promise<void>;
      section: string;
    }>,
    options?: RefreshOptions
  ) => Promise<void>;
  startAutoRefresh: (intervalMs: number, refreshFn: () => Promise<void>) => void;
  stopAutoRefresh: () => void;
  isAutoRefreshActive: boolean;
}

/**
 * Custom hook for managing dashboard refresh functionality
 * Provides manual and automatic refresh capabilities with status tracking
 */
export function useDashboardRefresh(): UseDashboardRefreshReturn {
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>({
    isRefreshing: false,
    lastRefresh: null,
    refreshCount: 0,
  });

  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(false);
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update refresh status
   */
  const updateRefreshStatus = useCallback((updates: Partial<RefreshStatus>) => {
    setRefreshStatus(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Execute single refresh operation
   */
  const refresh = useCallback(async (
    refreshFn: () => Promise<void>,
    options: RefreshOptions = {}
  ) => {
    const { showNotification = false, section, onSuccess, onError } = options;

    try {
      updateRefreshStatus({ isRefreshing: true });

      await refreshFn();

      updateRefreshStatus({
        isRefreshing: false,
        lastRefresh: new Date(),
        refreshCount: (refreshStatus?.refreshCount ?? 0) + 1,
      });

      if (showNotification) {
        console.log(`Dashboard ${section || 'data'} refreshed successfully`);
      }

      onSuccess?.();

    } catch (error) {
      console.error(`Error refreshing dashboard ${section || 'data'}:`, error);
      
      updateRefreshStatus({ isRefreshing: false });
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur de rafraichissement';
      onError?.(errorMessage);

      if (showNotification) {
        console.error(`Failed to refresh ${section || 'data'}: ${errorMessage}`);
      }
    }
  }, [refreshStatus?.refreshCount, updateRefreshStatus]);

  /**
   * Execute multiple refresh operations in parallel
   */
  const refreshMultiple = useCallback(async (
    refreshFns: Array<{
      fn: () => Promise<void>;
      section: string;
    }>,
    options: RefreshOptions = {}
  ) => {
    const { showNotification = false, onSuccess, onError } = options;

    try {
      updateRefreshStatus({ isRefreshing: true });

      // Execute all refresh functions in parallel
      const results = await Promise.allSettled(
        refreshFns.map(({ fn, section }) => 
          fn().catch(error => {
            console.error(`Error refreshing ${section}:`, error);
            throw new Error(`${section}: ${error.message}`);
          })
        )
      );

      // Check for any failures
      const failures = results
        .map((result, index) => ({ result, section: refreshFns[index].section }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ result, section }) => ({ 
          section, 
          error: (result as PromiseRejectedResult).reason 
        }));

      updateRefreshStatus({
        isRefreshing: false,
        lastRefresh: new Date(),
        refreshCount: (refreshStatus?.refreshCount ?? 0) + 1,
      });

      if (failures.length > 0) {
        const failureMessage = failures
          .map(f => `${f.section}: ${f.error.message}`)
          .join(', ');
        
        if (showNotification) {
          console.warn(`Partial refresh completed with errors: ${failureMessage}`);
        }
        
        onError?.(failureMessage);
      } else {
        if (showNotification) {
          console.log('All dashboard sections refreshed successfully');
        }
        
        onSuccess?.();
      }

    } catch (error) {
      console.error('Error in multiple refresh operation:', error);
      
      updateRefreshStatus({ isRefreshing: false });
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur de rafraichissement multiple';
      onError?.(errorMessage);

      if (showNotification) {
        console.error(`Failed to refresh dashboard sections: ${errorMessage}`);
      }
    }
  }, [refreshStatus?.refreshCount, updateRefreshStatus]);

  /**
   * Start automatic refresh interval
   */
  const startAutoRefresh = useCallback((
    intervalMs: number,
    refreshFn: () => Promise<void>
  ) => {
    // Clear existing interval
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
    }

    // Set up new interval
    autoRefreshInterval.current = setInterval(async () => {
      // Only auto-refresh if not currently refreshing
      if (!refreshStatus?.isRefreshing) {
        try {
          await refreshFn();
          
          updateRefreshStatus({
            lastRefresh: new Date(),
            refreshCount: (refreshStatus?.refreshCount ?? 0) + 1,
          });

        } catch (error) {
          console.error('Auto-refresh failed:', error);
          // Don't stop auto-refresh on error, just log it
        }
      }
    }, intervalMs);

    setIsAutoRefreshActive(true);

  }, [refreshStatus?.isRefreshing, refreshStatus?.refreshCount, updateRefreshStatus]);

  /**
   * Stop automatic refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
      autoRefreshInterval.current = null;
    }
    setIsAutoRefreshActive(false);
  }, []);

  /**
   * Clean up interval on unmount
   */
  useEffect(() => {
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, []);

  return {
    refreshStatus,
    refresh,
    refreshMultiple,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshActive,
  };
}

export default useDashboardRefresh;