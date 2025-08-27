import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Season } from '../../types/seasons';
import { SeasonsService } from '../../services/seasonsService';
import SeasonCard from './SeasonCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const SeasonsList: React.FC = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'current' | 'active' | 'archived'>('all');

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await SeasonsService.getAllSeasons();
      setSeasons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des saisons');
      console.error('Erreur lors du chargement des saisons:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSeasons = useMemo(() => {
    return seasons.filter(season => {
      // Filtre par recherche (nom et description)
      const matchesSearch = searchTerm === '' || 
        season.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (season.description && season.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtre par statut
      const matchesStatusFilter = filterStatus === 'all' ||
        (filterStatus === 'current' && season.is_current) ||
        (filterStatus === 'archived' && season.is_archived) ||
        (filterStatus === 'active' && !season.is_current && !season.is_archived);

      return matchesSearch && matchesStatusFilter;
    }).sort((a, b) => {
      // Trier par: current first, puis par date de création décroissante
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [seasons, searchTerm, filterStatus]);

  const handleSeasonClick = (season: Season) => {
    navigate(`/seasons/${season.id}`);
  };

  const handleAddSeason = () => {
    navigate('/seasons/new');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Saisons</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredSeasons.length} saison{filteredSeasons.length > 1 ? 's' : ''} trouvée{filteredSeasons.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleAddSeason}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle saison
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setError('')}
        />
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Rechercher une saison
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtre par statut */}
          <div className="sm:w-48">
            <label htmlFor="statusFilter" className="sr-only">
              Filtrer par statut
            </label>
            <select
              id="statusFilter"
              name="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'current' | 'active' | 'archived')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les saisons</option>
              <option value="current">Saison actuelle</option>
              <option value="active">Saisons actives</option>
              <option value="archived">Saisons archivées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des saisons */}
      {filteredSeasons.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune saison trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Essayez de modifier vos critères de recherche.' 
              : 'Commencez par créer une saison.'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <div className="mt-6">
              <button
                onClick={handleAddSeason}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer la première saison
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSeasons.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              onClick={handleSeasonClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SeasonsList;