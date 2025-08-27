// Dashboard components barrel export file
export { StatCard, type StatCardProps } from './StatCard';
export { 
  DashboardStatsComponent as DashboardStats,
  type DashboardStats as DashboardStatsType,
  type DashboardStatsProps 
} from './DashboardStats';
export { ActivityFeed, type ActivityFeedProps } from './ActivityFeed';
export { PopularGames, type PopularGamesProps, type PopularGame } from './PopularGames';
export { ChartCard, type ChartCardProps } from './ChartCard';
export { 
  ChartWidgets,
  BorrowingTrendChart,
  GamesAvailabilityChart,
  type ChartWidgetsProps,
  type BorrowingTrendData,
  type CustomChartData
} from './ChartWidgets';

// Re-export common types that might be used across components
export type { CurrentBorrowing } from '../../types/borrowings';