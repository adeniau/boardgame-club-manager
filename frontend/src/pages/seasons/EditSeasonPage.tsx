import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeasonForm from '../../components/seasons/SeasonForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { Season, UpdateSeasonRequest } from '../../types/seasons';
import { SeasonsService } from '../../services/seasonsService';
import { useNotifications } from '../../context/NotificationContext';

const EditSeasonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSeason = async () => {
      if (!id) {
        setError('ID de saison manquant');
        setLoading(false);
        return;
      }

      try {
        const seasonData = await SeasonsService.getSeasonById(parseInt(id));
        setSeason(seasonData);
      } catch (err) {
        console.error('Erreur lors du chargement de la saison:', err);
        setError('Erreur lors du chargement de la saison');
      } finally {
        setLoading(false);
      }
    };

    loadSeason();
  }, [id]);

  const handleSubmit = async (data: UpdateSeasonRequest): Promise<void> => {
    if (!season) return;

    try {
      await SeasonsService.updateSeason(season.id, data);
      addToast({ type: 'success', message: 'Saison modifiée avec succès' });
      navigate('/seasons');
    } catch (error) {
      console.error('Erreur lors de la modification de la saison:', error);
      addToast({ type: 'error', message: 'Erreur lors de la modification de la saison' });
    }
  };

  const handleCancel = () => {
    navigate('/seasons');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!season) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorAlert message="Saison non trouvée" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Modifier la Saison</h1>
          <p className="mt-2 text-gray-600">
            Modifiez les informations de la saison "{season.name}".
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SeasonForm 
            initialData={{
              name: season.name,
              description: season.description,
              start_date: season.start_date ? season.start_date.split('T')[0] : undefined,
              end_date: season.end_date ? season.end_date.split('T')[0] : undefined
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitText="Modifier la saison"
            isEditing
          />
        </div>
      </div>
    </div>
  );
};

export default EditSeasonPage;