import { useState, useEffect, useCallback, useMemo } from 'react';

import { DashboardService } from '../../services/dashboardService';
import type { DashboardStats } from '../../services/dashboardService';

export interface StatItem {
  key: keyof DashboardStats;
  title: string;
  value: string | number;
  iconName: 'puzzle' | 'users' | 'clipboard' | 'calendar';
  iconColor: 'blue' | 'green' | 'orange' | 'purple';
  loading: boolean;
  error: boolean;
}

export interface UseDashboardStatsReturn {
  stats: DashboardStats;
  statsItems: StatItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshStat: (statKey: keyof DashboardStats) => Promise<void>;
  isInitialLoad: boolean;
}

/**
 * Default fallback stats values
 */
const DEFAULT_STATS: DashboardStats = {
  totalGames: 0,
  totalMembers: 0,
  activeBorrowings: 0,
  currentSeason: '-',
};

/**
 * Custom hook for managing dashboard KPI statistics
 * Provides real-time stats calculation with individual loading states
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [individualLoading, setIndividualLoading] = useState<Partial<Record<keyof DashboardStats, boolean>>>({});

  /**
   * Load dashboard statistics
   */
  const loadStats = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const dashboardStats = await DashboardService.getDashboardStats();
      setStats(dashboardStats);

      setLoading(false);
      setIsInitialLoad(false);

    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      
      // Keep fallback stats on error
      setStats(DEFAULT_STATS);
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  /**
   * Refresh all statistics
   */
  const refresh = useCallback(async () => {
    if (isInitialLoad) {
      await loadStats();
    } else {
      try {
        setError(null);
        setLoading(true);

        const freshStats = await DashboardService.refreshStats();
        setStats(freshStats);

        setLoading(false);

      } catch (err) {
        console.error('Error refreshing dashboard stats:', err);
        setError('Erreur lors de la mise a jour des statistiques');
        setLoading(false);
      }
    }
  }, [isInitialLoad, loadStats]);

  /**
   * Refresh individual statistic
   * Note: Since our service returns all stats together, this will refresh all but update loading state for specific stat
   */
  const refreshStat = useCallback(async (statKey: keyof DashboardStats) => {
    try {
      setError(null);
      setIndividualLoading(prev => ({ ...prev, [statKey]: true }));

      const freshStats = await DashboardService.refreshStats();
      setStats(freshStats);

      setIndividualLoading(prev => ({ ...prev, [statKey]: false }));

    } catch (err) {
      console.error(`Error refreshing stat ${statKey}:`, err);
      setError(`Erreur lors de la mise a jour de ${statKey}`);
      setIndividualLoading(prev => ({ ...prev, [statKey]: false }));
    }
  }, []);

  /**
   * Format stats into display items with icons and metadata
   */
  const statsItems = useMemo((): StatItem[] => {
    return [
      {
        key: 'totalGames',
        title: 'Total Jeux',
        value: stats.totalGames,
        iconName: 'puzzle',
        iconColor: 'blue' as const,
        loading: loading || !!individualLoading.totalGames,
        error: false,
      },
      {
        key: 'totalMembers',
        title: 'Membres Actifs',
        value: stats.totalMembers,
        iconName: 'users',
        iconColor: 'green' as const,
        loading: loading || !!individualLoading.totalMembers,
        error: false,
      },
      {
        key: 'activeBorrowings',
        title: 'Emprunts Actifs',
        value: stats.activeBorrowings,
        iconName: 'clipboard',
        iconColor: 'orange' as const,
        loading: loading || !!individualLoading.activeBorrowings,
        error: false,
      },
      {
        key: 'currentSeason',
        title: 'Saison Courante',
        value: stats.currentSeason,
        iconName: 'calendar',
        iconColor: 'purple' as const,
        loading: loading || !!individualLoading.currentSeason,
        error: false,
      },
    ];
  }, [stats, loading, individualLoading]);

  /**
   * Load stats on mount
   */
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    statsItems,
    loading,
    error,
    refresh,
    refreshStat,
    isInitialLoad,
  };
}

export default useDashboardStats;