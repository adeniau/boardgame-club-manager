import { format, subDays, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

import { GamesService } from './gamesService';
import { MembersService } from './membersService';
import { BorrowingsService } from './borrowingsService';
import { SeasonsService } from './seasonsService';

import type { CurrentBorrowing } from '../types/borrowings';
import type { Game } from '../types/games';

// Dashboard specific types
export interface DashboardStats {
  totalGames: number;
  totalMembers: number;
  activeBorrowings: number;
  currentSeason: string;
}

export interface PopularGame {
  id: number;
  name: string;
  picture?: string | undefined;
  borrowCount: number;
}

export interface BorrowingTrendData {
  date: string;
  count: number;
}

export interface ChartDatasets {
  borrowingTrends: BorrowingTrendData[];
  gamesAvailability: {
    available: number;
    borrowed: number;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: CurrentBorrowing[];
  popularGames: PopularGame[];
  chartData: ChartDatasets;
}

export interface DashboardLoadingState {
  stats: boolean;
  recentBorrowings: boolean;
  popularGames: boolean;
  charts: boolean;
}

/**
 * Service for handling dashboard data aggregation and processing
 */
export class DashboardService {
  
  /**
   * Get aggregated dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all required data in parallel
      const [gamesData, membersData, currentBorrowingsData, seasonsData] = await Promise.allSettled([
        GamesService.getAllGames(),
        MembersService.getAllMembers(),
        BorrowingsService.getCurrentBorrowings(),
        SeasonsService.getAllSeasons(),
      ]);

      const games = gamesData.status === 'fulfilled' ? gamesData.value : [];
      const members = membersData.status === 'fulfilled' ? membersData.value : [];
      const currentBorrowings = currentBorrowingsData.status === 'fulfilled' ? currentBorrowingsData.value : [];
      const seasons = seasonsData.status === 'fulfilled' ? seasonsData.value : [];
      
      const currentSeason = seasons.length > 0 ? seasons[0]?.name || '-' : '-';

      return {
        totalGames: games.length,
        totalMembers: members.length,
        activeBorrowings: currentBorrowings.length,
        currentSeason,
      };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback stats
      return {
        totalGames: 0,
        totalMembers: 0,
        activeBorrowings: 0,
        currentSeason: '-',
      };
    }
  }

  /**
   * Get recent borrowing activity
   */
  static async getRecentActivity(limit = 8): Promise<CurrentBorrowing[]> {
    try {
      const currentBorrowings = await BorrowingsService.getCurrentBorrowings();
      
      // Sort by borrow date (most recent first) and limit results
      return currentBorrowings
        .sort((a, b) => new Date(b.borrow_date).getTime() - new Date(a.borrow_date).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Calculate most popular games based on current borrowings
   */
  static async getPopularGames(limit = 5): Promise<PopularGame[]> {
    try {
      const currentBorrowings = await BorrowingsService.getCurrentBorrowings();
      
      // Aggregate game borrowing counts
      const gameStats = new Map<number, { name: string, picture?: string, count: number }>();
      
      currentBorrowings.forEach(borrowing => {
        const existing = gameStats.get(borrowing.id_game) || { 
          name: borrowing.game_name, 
          picture: borrowing.game_picture,
          count: 0 
        };
        gameStats.set(borrowing.id_game, {
          name: existing.name,
          picture: existing.picture,
          count: existing.count + 1
        });
      });

      // Convert to array, sort by popularity, and limit results
      return Array.from(gameStats.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          picture: data.picture || undefined,
          borrowCount: data.count,
        }))
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, limit);

    } catch (error) {
      console.error('Error calculating popular games:', error);
      return [];
    }
  }

  /**
   * Generate chart data for borrowing trends and games availability
   */
  static async getChartData(): Promise<ChartDatasets> {
    try {
      const [currentBorrowings, gamesData] = await Promise.allSettled([
        BorrowingsService.getCurrentBorrowings(),
        GamesService.getAllGames(),
      ]);

      const borrowings = currentBorrowings.status === 'fulfilled' ? currentBorrowings.value : [];
      const games = gamesData.status === 'fulfilled' ? gamesData.value : [];

      // Calculate borrowing trends for the last 7 days
      const borrowingTrends = this.calculateBorrowingTrends(borrowings);

      // Calculate games availability
      const gamesAvailability = this.calculateGamesAvailability(games, borrowings);

      return {
        borrowingTrends,
        gamesAvailability,
      };

    } catch (error) {
      console.error('Error generating chart data:', error);
      // Return fallback data
      return {
        borrowingTrends: this.generateFallbackBorrowingTrends(),
        gamesAvailability: {
          available: 0,
          borrowed: 0,
        },
      };
    }
  }

  /**
   * Master method to fetch all dashboard data in parallel
   */
  static async getDashboardData(): Promise<DashboardData> {
    try {
      // Fetch all data in parallel for optimal performance
      const [stats, recentActivity, popularGames, chartData] = await Promise.allSettled([
        this.getDashboardStats(),
        this.getRecentActivity(),
        this.getPopularGames(),
        this.getChartData(),
      ]);

      return {
        stats: stats.status === 'fulfilled' ? stats.value : {
          totalGames: 0,
          totalMembers: 0,
          activeBorrowings: 0,
          currentSeason: '-',
        },
        recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value : [],
        popularGames: popularGames.status === 'fulfilled' ? popularGames.value : [],
        chartData: chartData.status === 'fulfilled' ? chartData.value : {
          borrowingTrends: this.generateFallbackBorrowingTrends(),
          gamesAvailability: { available: 0, borrowed: 0 },
        },
      };

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  /**
   * Calculate borrowing trends for the last 7 days
   */
  private static calculateBorrowingTrends(borrowings: CurrentBorrowing[]): BorrowingTrendData[] {
    const endDate = new Date();
    const startDate = subDays(endDate, 6); // Last 7 days including today
    
    // Generate all dates in the range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Count borrowings by date
    const borrowingsByDate = new Map<string, number>();
    
    borrowings.forEach(borrowing => {
      const borrowDate = new Date(borrowing.borrow_date);
      const dateKey = format(borrowDate, 'yyyy-MM-dd');
      
      // Only include borrowings from the last 7 days
      if (borrowDate >= startDate && borrowDate <= endDate) {
        borrowingsByDate.set(dateKey, (borrowingsByDate.get(dateKey) || 0) + 1);
      }
    });

    // Generate trend data for all dates in range
    return dateRange.map(date => ({
      date: format(date, 'dd/MM', { locale: fr }),
      count: borrowingsByDate.get(format(date, 'yyyy-MM-dd')) || 0,
    }));
  }

  /**
   * Calculate games availability statistics
   */
  private static calculateGamesAvailability(
    games: Game[], 
    borrowings: CurrentBorrowing[]
  ): { available: number; borrowed: number } {
    const totalGames = games.length;
    const borrowedGames = borrowings.length;
    const availableGames = Math.max(0, totalGames - borrowedGames);

    return {
      available: availableGames,
      borrowed: borrowedGames,
    };
  }

  /**
   * Generate fallback borrowing trends data when API fails
   */
  private static generateFallbackBorrowingTrends(): BorrowingTrendData[] {
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map(date => ({
      date: format(date, 'dd/MM', { locale: fr }),
      count: 0,
    }));
  }

  /**
   * Refresh specific data section
   */
  static async refreshStats(): Promise<DashboardStats> {
    return this.getDashboardStats();
  }

  static async refreshRecentActivity(limit = 8): Promise<CurrentBorrowing[]> {
    return this.getRecentActivity(limit);
  }

  static async refreshPopularGames(limit = 5): Promise<PopularGame[]> {
    return this.getPopularGames(limit);
  }

  static async refreshChartData(): Promise<ChartDatasets> {
    return this.getChartData();
  }
}

export default DashboardService;