import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  UsersIcon, 
  CubeIcon, 
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { Season, SeasonStats } from '../../types/seasons';
import { SeasonsService } from '../../services/seasonsService';
import { useNotifications } from '../../context/NotificationContext';

const SeasonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  
  const [season, setSeason] = useState<Season | null>(null);
  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadSeasonDetails = async () => {
      if (!id) {
        setError('ID de saison manquant');
        setLoading(false);
        return;
      }

      try {
        const [seasonData, statsData] = await Promise.all([
          SeasonsService.getSeasonById(parseInt(id)),
          SeasonsService.getSeasonStats(parseInt(id))
        ]);
        
        setSeason(seasonData);
        setStats(statsData);
      } catch (err) {
        console.error('Erreur lors du chargement des détails de la saison:', err);
        setError('Erreur lors du chargement des détails de la saison');
      } finally {
        setLoading(false);
      }
    };

    loadSeasonDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!season) return;

    try {
      await SeasonsService.deleteSeason(season.id);
      addToast({ type: 'success', message: 'Saison supprimée avec succès' });
      navigate('/seasons');
    } catch (error) {
      console.error('Erreur lors de la suppression de la saison:', error);
      addToast({ type: 'error', message: 'Erreur lors de la suppression de la saison' });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorAlert message={error || 'Saison non trouvée'} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header avec navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/seasons')}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Retour aux saisons
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/seasons/${season.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {season.name}
              {season.is_current && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Saison actuelle
                </span>
              )}
            </h1>
            {season.description && (
              <p className="text-gray-600">{season.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>Début: {formatDate(season.start_date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>Fin: {formatDate(season.end_date)}</span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Membres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emprunts totaux</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBorrowings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emprunts actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBorrowings}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jeux populaires et membres actifs */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jeux les plus empruntés */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Jeux les plus empruntés
            </h3>
            {stats.popularGames && stats.popularGames.length > 0 ? (
              <div className="space-y-3">
                {stats.popularGames.slice(0, 5).map((game) => (
                  <div key={game.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">
                      {game.game_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {game.borrow_count} emprunt{game.borrow_count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun emprunt pour cette saison</p>
            )}
          </div>

          {/* Membres les plus actifs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Membres les plus actifs
            </h3>
            {stats.activeMembers && stats.activeMembers.length > 0 ? (
              <div className="space-y-3">
                {stats.activeMembers.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">
                      {member.member_firstname} {member.member_lastname}
                    </span>
                    <span className="text-sm text-gray-500">
                      {member.borrow_count} emprunt{member.borrow_count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun membre actif pour cette saison</p>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer la saison"
        message={`Êtes-vous sûr de vouloir supprimer la saison "${season.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};

export default SeasonDetailPage;