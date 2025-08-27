import { useMemo } from 'react';
import type { ChartData, ChartOptions } from 'chart.js';

import type { 
  ChartDatasets
} from '../../services/dashboardService';

export interface ChartDataFormats {
  borrowingTrends: ChartData<'bar'>;
  gamesAvailability: ChartData<'doughnut'>;
}

export interface ChartOptionsFormats {
  borrowingTrends: ChartOptions<'bar'>;
  gamesAvailability: ChartOptions<'doughnut'>;
}

export interface UseChartDataReturn {
  chartData: ChartDataFormats;
  chartOptions: ChartOptionsFormats;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for processing dashboard chart data
 * Handles Chart.js data formatting and configuration
 */
export function useChartData(
  chartDataSource?: ChartDatasets | null,
  loading = false,
  error: string | null = null
): UseChartDataReturn {

  /**
   * Process borrowing trends data for Chart.js Bar component
   */
  const borrowingTrendsData = useMemo((): ChartData<'bar'> => {
    if (!chartDataSource?.borrowingTrends) {
      // Return empty chart data structure
      return {
        labels: [],
        datasets: [
          {
            label: 'Emprunts par jour',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      };
    }

    const trends = chartDataSource.borrowingTrends;

    return {
      labels: trends.map(d => d.date),
      datasets: [
        {
          label: 'Emprunts par jour',
          data: trends.map(d => d.count),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [chartDataSource?.borrowingTrends]);

  /**
   * Process games availability data for Chart.js Doughnut component
   */
  const gamesAvailabilityData = useMemo((): ChartData<'doughnut'> => {
    if (!chartDataSource?.gamesAvailability) {
      // Return empty chart data structure
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

    const availability = chartDataSource.gamesAvailability;

    return {
      labels: ['Disponibles', 'Empruntés'],
      datasets: [
        {
          data: [availability.available, availability.borrowed],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(251, 146, 60)',
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            'rgba(34, 197, 94, 0.9)',
            'rgba(251, 146, 60, 0.9)',
          ],
          hoverBorderWidth: 3,
        },
      ],
    };
  }, [chartDataSource?.gamesAvailability]);

  /**
   * Chart options configuration
   */
  const chartOptions = useMemo((): ChartOptionsFormats => {
    return {
      borrowingTrends: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(59, 130, 246, 0.8)',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${value} emprunt${value > 1 ? 's' : ''}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 12,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(107, 114, 128, 0.1)',
            },
            ticks: {
              stepSize: 1,
              color: '#6B7280',
              font: {
                size: 12,
              },
              callback: (value) => {
                // Only show integer values
                if (Number.isInteger(value as number)) {
                  return value;
                }
                return '';
              },
            },
          },
        },
        animation: {
          duration: 750,
          easing: 'easeInOutCubic',
        },
      },

      gamesAvailability: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#374151',
              font: {
                size: 12,
                weight: 'normal',
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(107, 114, 128, 0.3)',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((sum, val) => sum + (val as number), 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return `${label}: ${value} jeux (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeInOutCubic',
        },
        cutout: '60%', // Creates the doughnut hole
        elements: {
          arc: {
            borderWidth: 2,
          },
        },
      },
    };
  }, []);

  return {
    chartData: {
      borrowingTrends: borrowingTrendsData,
      gamesAvailability: gamesAvailabilityData,
    },
    chartOptions,
    loading,
    error,
  };
}

export default useChartData;