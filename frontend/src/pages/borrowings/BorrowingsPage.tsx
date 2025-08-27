import React, { useState } from 'react';
import { CurrentBorrowing } from '../../types/borrowings';
import CreateBorrowingForm from '../../components/borrowings/CreateBorrowingForm';
import CurrentBorrowings from '../../components/borrowings/CurrentBorrowings';
import ReturnBorrowingForm from '../../components/borrowings/ReturnBorrowingForm';
import BorrowingsHistory from '../../components/borrowings/BorrowingsHistory';
import BorrowingStats from '../../components/borrowings/BorrowingStats';

type ActiveTab = 'current' | 'new' | 'history' | 'stats';

const BorrowingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('current');
  const [selectedBorrowing, setSelectedBorrowing] = useState<CurrentBorrowing | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReturnClick = (borrowing: CurrentBorrowing) => {
    setSelectedBorrowing(borrowing);
  };

  const handleReturnSuccess = () => {
    setSelectedBorrowing(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReturnCancel = () => {
    setSelectedBorrowing(null);
  };

  const handleBorrowingCreated = () => {
    setActiveTab('current');
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    {
      id: 'current' as ActiveTab,
      name: 'Emprunts en cours',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'new' as ActiveTab,
      name: 'Nouvel emprunt',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      id: 'history' as ActiveTab,
      name: 'Historique',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'stats' as ActiveTab,
      name: 'Statistiques',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6" id="main-content">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Emprunts</h1>
          <p className="text-gray-600 mt-1">
            Gérez les emprunts de jeux, les retours et consultez l'historique
          </p>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={`mr-2 ${
                activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}>
                {tab.icon}
              </span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === 'current' && (
          <CurrentBorrowings 
            onReturnClick={handleReturnClick}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {activeTab === 'new' && (
          <CreateBorrowingForm onSuccess={handleBorrowingCreated} />
        )}
        
        {activeTab === 'history' && (
          <BorrowingsHistory refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === 'stats' && (
          <BorrowingStats refreshTrigger={refreshTrigger} />
        )}
      </div>

      {/* Modal de retour d'emprunt */}
      {selectedBorrowing && (
        <ReturnBorrowingForm
          borrowing={selectedBorrowing}
          onSuccess={handleReturnSuccess}
          onCancel={handleReturnCancel}
        />
      )}
    </div>
  );
};

export default BorrowingsPage;