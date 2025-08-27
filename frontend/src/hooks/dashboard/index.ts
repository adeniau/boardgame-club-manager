// Dashboard hooks barrel export
export { useDashboardData } from './useDashboardData';
export type { UseDashboardDataReturn } from './useDashboardData';

export { useChartData } from './useChartData';
export type { 
  UseChartDataReturn, 
  ChartDataFormats, 
  ChartOptionsFormats 
} from './useChartData';

export { useDashboardStats } from './useDashboardStats';
export type { 
  UseDashboardStatsReturn, 
  StatItem 
} from './useDashboardStats';

export { useDashboardRefresh } from './useDashboardRefresh';
export type { 
  UseDashboardRefreshReturn, 
  RefreshStatus, 
  RefreshOptions 
} from './useDashboardRefresh';

// Re-export service types that are commonly used with hooks
export type { 
  DashboardData,
  DashboardStats,
  PopularGame,
  BorrowingTrendData,
  ChartDatasets,
  DashboardLoadingState
} from '../../services/dashboardService';