import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';

import GamesList from './components/games/GamesList';
import AddGameForm from './components/games/AddGameForm';
import GameDetail from './components/games/GameDetail';
import EditGameForm from './components/games/EditGameForm';

// Pages membres
import MembersPage from './pages/members/MembersPage';
import AddMemberPage from './pages/members/AddMemberPage';
import MemberDetailPage from './pages/members/MemberDetailPage';
import EditMemberPage from './pages/members/EditMemberPage';

// Pages temporaires pour les autres modules
function GamesPage() {
  return <GamesList />;
}

function AddGamePage() {
  return <AddGameForm />;
}

function GameDetailPage() {
  return <GameDetail />;
}

function EditGamePage() {
  return <EditGameForm />;
}


function BorrowingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestion des Emprunts</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="mt-4 text-lg font-medium">Module Emprunts</p>
          <p className="text-sm text-gray-400 mt-1">Disponible dans la Phase 5</p>
        </div>
      </div>
    </div>
  );
}

function SeasonsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestion des Saisons</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-lg font-medium">Module Saisons</p>
          <p className="text-sm text-gray-400 mt-1">Disponible dans la Phase 7</p>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg 
            className="animate-spin h-8 w-8 text-blue-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-lg text-gray-700">Chargement de l'application...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route publique */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />

      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="games/new" element={<AddGamePage />} />
        <Route path="games/:id" element={<GameDetailPage />} />
        <Route path="games/:id/edit" element={<EditGamePage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/new" element={<AddMemberPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />
        <Route path="members/:id/edit" element={<EditMemberPage />} />
        <Route path="borrowings" element={<BorrowingsPage />} />
        <Route path="seasons" element={<SeasonsPage />} />
      </Route>

      {/* Route par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Skip link pour l'accessibilité */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 transition-all"
        >
          Aller au contenu principal
        </a>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}