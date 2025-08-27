import React from 'react';
import { useNavigate } from 'react-router-dom';
import SeasonForm from '../../components/seasons/SeasonForm';
import { CreateSeasonRequest, UpdateSeasonRequest } from '../../types/seasons';
import { SeasonsService } from '../../services/seasonsService';
import { useNotifications } from '../../context/NotificationContext';

const AddSeasonPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const handleSubmit = async (data: CreateSeasonRequest | UpdateSeasonRequest): Promise<void> => {
    try {
      await SeasonsService.createSeason(data as CreateSeasonRequest);
      showToast({ type: 'success', title: 'Succès', message: 'Saison créée avec succès' });
      navigate('/seasons');
    } catch (error) {
      console.error('Erreur lors de la création de la saison:', error);
      showToast({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création de la saison' });
    }
  };

  const handleCancel = () => {
    navigate('/seasons');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Saison</h1>
          <p className="mt-2 text-gray-600">
            Créez une nouvelle saison pour organiser les adhésions et les emprunts.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SeasonForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitText="Créer la saison"
          />
        </div>
      </div>
    </div>
  );
};

export default AddSeasonPage;