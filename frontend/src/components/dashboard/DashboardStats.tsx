import React from 'react';
import { StatCard } from './StatCard';

export interface DashboardStats {
  totalGames: number;
  totalMembers: number;
  activeBorrowings: number;
  currentSeason: string;
}

export interface DashboardStatsProps {
  stats: DashboardStats;
  loading?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export const DashboardStatsComponent: React.FC<DashboardStatsProps> = ({
  stats,
  loading = false,
  variant = 'default',
  className = '',
}) => {
  const gridCols = variant === 'compact' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      <StatCard
        title="Total Jeux"
        value={stats.totalGames}
        loading={loading}
        variant={variant}
        iconColor="blue"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" 
            />
          </svg>
        }
      />

      <StatCard
        title="Membres Actifs"
        value={stats.totalMembers}
        loading={loading}
        variant={variant}
        iconColor="green"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
            />
          </svg>
        }
      />

      <StatCard
        title="Emprunts Actifs"
        value={stats.activeBorrowings}
        loading={loading}
        variant={variant}
        iconColor="orange"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
            />
          </svg>
        }
      />

      <StatCard
        title="Saison Courante"
        value={stats.currentSeason}
        loading={loading}
        variant={variant}
        iconColor="purple"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        }
      />
    </div>
  );
};

export default DashboardStatsComponent;