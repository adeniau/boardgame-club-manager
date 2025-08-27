
import { useDashboardData, useChartData } from '../../hooks/dashboard';
import {
  DashboardStats,
  ActivityFeed,
  PopularGames,
  ChartWidgets,
} from '../../components/dashboard';

export default function Dashboard() {
  // Use the new dashboard data hook
  const { data, loading, error, refresh } = useDashboardData();
  
  // Chart data is handled directly by the ChartWidgets component

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ Erreur</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble de votre club de jeux de société
        </p>
      </div>

      {/* KPI Cards */}
      <DashboardStats 
        stats={data?.stats || {
          totalGames: 0,
          totalMembers: 0,
          activeBorrowings: 0,
          currentSeason: '-',
        }} 
        loading={loading.stats} 
        className="mb-8"
      />

      {/* Activity Feed and Popular Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ActivityFeed 
          borrowings={data?.recentActivity || []} 
          loading={loading.recentBorrowings}
          limit={8}
          showPhotos={true}
        />
        
        <PopularGames 
          games={data?.popularGames || []} 
          loading={loading.popularGames}
          limit={5}
          showRanking={true}
          showImages={true}
        />
      </div>

      {/* Charts */}
      <ChartWidgets
        gamesAvailability={data?.chartData?.gamesAvailability}
        borrowingTrends={data?.chartData?.borrowingTrends}
        loading={loading.charts}
        className="mb-8"
        onRetry={refresh}
      />

      {/* Info Banner */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Dashboard Intégré</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Le tableau de bord affiche maintenant des données en temps réel avec des indicateurs de performance, 
                l'activité récente et des visualisations graphiques pour une meilleure analyse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}