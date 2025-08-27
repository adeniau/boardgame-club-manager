import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { ChartCard } from './ChartCard';


export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface CustomChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface BorrowingTrendData {
  date: string;
  count: number;
}

export interface ChartWidgetsProps {
  borrowingTrends?: BorrowingTrendData[] | CustomChartData;
  gamesAvailability?: {
    available: number;
    borrowed: number;
  } | CustomChartData;
  loading?: boolean;
  error?: string | null;
  className?: string;
  showBorrowingTrend?: boolean;
  showGamesAvailability?: boolean;
  chartHeight?: string;
  onRetry?: (() => void) | undefined;
}

const defaultChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

const defaultDoughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
};

export const ChartWidgets: React.FC<ChartWidgetsProps> = ({
  borrowingTrends,
  gamesAvailability,
  loading = false,
  error = null,
  className = '',
  showBorrowingTrend = true,
  showGamesAvailability = true,
  chartHeight = 'h-64',
  onRetry,
}) => {
  // Process borrowing trends data
  const borrowingsTrendData = useMemo((): ChartData<'bar'> => {
    if (!borrowingTrends) {
      // Generate mock data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: format(date, 'dd/MM', { locale: fr }),
          count: Math.floor(Math.random() * 5) + 1,
        };
      });

      return {
        labels: last7Days.map(d => d.date),
        datasets: [
          {
            label: 'Emprunts par jour',
            data: last7Days.map(d => d.count),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      };
    }

    // Handle array format (BorrowingTrendData[])
    if (Array.isArray(borrowingTrends)) {
      return {
        labels: borrowingTrends.map(d => d.date),
        datasets: [
          {
            label: 'Emprunts par jour',
            data: borrowingTrends.map(d => d.count),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      };
    }

    // Handle CustomChartData format
    return borrowingTrends as ChartData<'bar'>;
  }, [borrowingTrends]);

  // Process games availability data
  const gamesAvailabilityData = useMemo((): ChartData<'doughnut'> => {
    if (!gamesAvailability) {
      return {
        labels: ['Disponibles', 'Empruntés'],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 146, 60, 0.8)',
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(251, 146, 60)',
            ],
            borderWidth: 2,
          },
        ],
      };
    }

    // Handle object format with available/borrowed
    if ('available' in gamesAvailability && 'borrowed' in gamesAvailability) {
      return {
        labels: ['Disponibles', 'Empruntés'],
        datasets: [
          {
            data: [gamesAvailability.available, gamesAvailability.borrowed],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 146, 60, 0.8)',
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(251, 146, 60)',
            ],
            borderWidth: 2,
          },
        ],
      };
    }

    // Handle CustomChartData format
    return gamesAvailability as ChartData<'doughnut'>;
  }, [gamesAvailability]);

  if (!showBorrowingTrend && !showGamesAvailability) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {showBorrowingTrend && (
        <ChartCard
          title="Tendance des Emprunts (7 derniers jours)"
          loading={loading}
          error={error}
          height={chartHeight}
          onRetry={onRetry}
        >
          <Bar
            data={borrowingsTrendData}
            options={defaultChartOptions}
          />
        </ChartCard>
      )}

      {showGamesAvailability && (
        <ChartCard
          title="Disponibilité des Jeux"
          loading={loading}
          error={error}
          height={chartHeight}
          onRetry={onRetry}
        >
          <Doughnut
            data={gamesAvailabilityData}
            options={defaultDoughnutOptions}
          />
        </ChartCard>
      )}
    </div>
  );
};

// Individual chart components for reuse elsewhere
export const BorrowingTrendChart: React.FC<{
  data: BorrowingTrendData[] | CustomChartData;
  loading?: boolean;
  error?: string | null;
  height?: string;
  title?: string;
  onRetry?: (() => void) | undefined;
}> = ({ 
  data, 
  loading = false, 
  error = null, 
  height = 'h-64', 
  title = "Tendance des Emprunts",
  onRetry
}) => {
  const chartData = useMemo((): ChartData<'bar'> => {
    if (Array.isArray(data)) {
      return {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Emprunts par jour',
            data: data.map(d => d.count),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      };
    }
    return data as ChartData<'bar'>;
  }, [data]);

  return (
    <ChartCard
      title={title}
      loading={loading}
      error={error}
      height={height}
      onRetry={onRetry}
    >
      <Bar data={chartData} options={defaultChartOptions} />
    </ChartCard>
  );
};

export const GamesAvailabilityChart: React.FC<{
  data: { available: number; borrowed: number } | CustomChartData;
  loading?: boolean;
  error?: string | null;
  height?: string;
  title?: string;
  chartType?: 'doughnut' | 'pie';
  onRetry?: (() => void) | undefined;
}> = ({ 
  data, 
  loading = false, 
  error = null, 
  height = 'h-64', 
  title = "Disponibilité des Jeux",
  chartType = 'doughnut',
  onRetry
}) => {
  const chartData = useMemo(() => {
    if ('available' in data && 'borrowed' in data) {
      return {
        labels: ['Disponibles', 'Empruntés'],
        datasets: [
          {
            data: [data.available, data.borrowed],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 146, 60, 0.8)',
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(251, 146, 60)',
            ],
            borderWidth: 2,
          },
        ],
      };
    }
    return data as any;
  }, [data]);

  const ChartComponent = chartType === 'pie' ? Pie : Doughnut;

  return (
    <ChartCard
      title={title}
      loading={loading}
      error={error}
      height={height}
      onRetry={onRetry}
    >
      <ChartComponent data={chartData} options={defaultDoughnutOptions as any} />
    </ChartCard>
  );
};

export default ChartWidgets;