import { useState, useEffect, useCallback } from 'react';

import { DashboardService } from '../../services/dashboardService';
import type { 
  DashboardData, 
  DashboardLoadingState
} from '../../services/dashboardService';

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: DashboardLoadingState;
  error: string | null;
  refresh: () => Promise<void>;
  refreshSection: (section: keyof DashboardLoadingState) => Promise<void>;
  isInitialLoad: boolean;
}

/**
 * Custom hook for managing dashboard data fetching and state
 * Provides comprehensive dashboard data with loading states and error handling
 */
export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<DashboardLoadingState>({
    stats: true,
    recentBorrowings: true,
    popularGames: true,
    charts: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /**
   * Update loading state for a specific section
   */
  const updateLoadingState = useCallback((section: keyof DashboardLoadingState, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [section]: isLoading }));
  }, []);

  /**
   * Update data for a specific section
   */
  const updateDataSection = useCallback((section: string, newData: any) => {
    setData(prevData => {
      if (!prevData) return null;
      return { ...prevData, [section]: newData };
    });
  }, []);

  /**
   * Load all dashboard data
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      // Set all loading states to true
      setLoading({
        stats: true,
        recentBorrowings: true,
        popularGames: true,
        charts: true,
      });

      // Fetch all data using DashboardService
      const dashboardData = await DashboardService.getDashboardData();
      
      // Update data and set loading to false
      setData(dashboardData);
      setLoading({
        stats: false,
        recentBorrowings: false,
        popularGames: false,
        charts: false,
      });

      setIsInitialLoad(false);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des donnees');
      
      // Set loading to false even on error
      setLoading({
        stats: false,
        recentBorrowings: false,
        popularGames: false,
        charts: false,
      });

      setIsInitialLoad(false);
    }
  }, []);

  /**
   * Refresh specific data section
   */
  const refreshSection = useCallback(async (section: keyof DashboardLoadingState) => {
    if (!data) return;

    try {
      setError(null);
      updateLoadingState(section, true);

      let newData: any;

      switch (section) {
        case 'stats':
          newData = await DashboardService.refreshStats();
          updateDataSection('stats', newData);
          break;

        case 'recentBorrowings':
          newData = await DashboardService.refreshRecentActivity();
          updateDataSection('recentActivity', newData);
          break;

        case 'popularGames':
          newData = await DashboardService.refreshPopularGames();
          updateDataSection('popularGames', newData);
          break;

        case 'charts':
          newData = await DashboardService.refreshChartData();
          updateDataSection('chartData', newData);
          break;
      }

      updateLoadingState(section, false);

    } catch (err) {
      console.error(`Error refreshing ${section}:`, err);
      setError(`Erreur lors de la mise a jour de ${section}`);
      updateLoadingState(section, false);
    }
  }, [data, updateLoadingState, updateDataSection]);

  /**
   * Refresh all dashboard data
   */
  const refresh = useCallback(async () => {
    if (isInitialLoad) {
      // If it's initial load, use the full loading flow
      await loadDashboardData();
    } else {
      // For refreshes, update all sections in parallel without showing full loading
      try {
        setError(null);
        
        // Set all loading states
        setLoading({
          stats: true,
          recentBorrowings: true,
          popularGames: true,
          charts: true,
        });

        // Fetch fresh data
        const [stats, recentActivity, popularGames, chartData] = await Promise.allSettled([
          DashboardService.refreshStats(),
          DashboardService.refreshRecentActivity(),
          DashboardService.refreshPopularGames(),
          DashboardService.refreshChartData(),
        ]);

        // Update data sections
        setData(prevData => {
          if (!prevData) return null;

          return {
            ...prevData,
            stats: stats.status === 'fulfilled' ? stats.value : prevData.stats,
            recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value : prevData.recentActivity,
            popularGames: popularGames.status === 'fulfilled' ? popularGames.value : prevData.popularGames,
            chartData: chartData.status === 'fulfilled' ? chartData.value : prevData.chartData,
          };
        });

        // Clear loading states
        setLoading({
          stats: false,
          recentBorrowings: false,
          popularGames: false,
          charts: false,
        });

      } catch (err) {
        console.error('Error refreshing dashboard data:', err);
        setError('Erreur lors de la mise a jour des donnees');
        
        setLoading({
          stats: false,
          recentBorrowings: false,
          popularGames: false,
          charts: false,
        });
      }
    }
  }, [isInitialLoad, loadDashboardData]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    data,
    loading,
    error,
    refresh,
    refreshSection,
    isInitialLoad,
  };
}

export default useDashboardData;