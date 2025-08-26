import { useState, useEffect } from 'react';
import { BorrowingCreateRequest, BorrowingFormData } from '../types/borrowings';
import { Member } from '../types/members';
import { Game } from '../types/games';
import { SeasonsService, Season } from '../services/seasonsService';

interface UseBorrowingFormOptions {
  onError?: (error: string) => void;
}

interface FormErrors {
  selectedMember?: string;
  selectedGame?: string;
  borrowDate?: string;
  general?: string;
}

export const useBorrowingForm = (_options: UseBorrowingFormOptions = {}) => {
  const [formData, setFormData] = useState<BorrowingFormData>({
    selectedMember: null,
    selectedGame: null,
    borrowDate: new Date().toISOString().split('T')[0] || '', // Date d'aujourd'hui par défaut
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);

  // Charger la saison courante
  useEffect(() => {
    const loadCurrentSeason = async () => {
      try {
        const season = await SeasonsService.getCurrentSeason();
        setCurrentSeason(season);
      } catch (error) {
        console.error('Erreur lors du chargement de la saison courante:', error);
      }
    };

    loadCurrentSeason();
  }, []);

  const updateSelectedMember = (member: Member | null) => {
    setFormData(prev => ({
      ...prev,
      selectedMember: member ? {
        id: member.id,
        firstname: member.firstname,
        lastname: member.name,
        email: member.email,
        picture: member.picture,
      } : null
    }));

    // Effacer l'erreur du champ
    if (errors.selectedMember) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selectedMember;
        return newErrors;
      });
    }
  };

  const updateSelectedGame = (game: Game | null) => {
    setFormData(prev => ({
      ...prev,
      selectedGame: game ? {
        id: game.id,
        name: game.name,
        picture: game.picture,
        available: Number(game.available),
      } : null
    }));

    // Effacer l'erreur du champ
    if (errors.selectedGame) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selectedGame;
        return newErrors;
      });
    }
  };

  const updateBorrowDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      borrowDate: date
    }));

    // Effacer l'erreur du champ
    if (errors.borrowDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.borrowDate;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du membre sélectionné
    if (!formData.selectedMember) {
      newErrors.selectedMember = 'Veuillez sélectionner un membre';
    }

    // Validation du jeu sélectionné
    if (!formData.selectedGame) {
      newErrors.selectedGame = 'Veuillez sélectionner un jeu';
    } else if (formData.selectedGame.available === 0) {
      newErrors.selectedGame = 'Ce jeu n\'est pas disponible actuellement';
    }

    // Validation de la date d'emprunt
    if (!formData.borrowDate) {
      newErrors.borrowDate = 'Veuillez saisir une date d\'emprunt';
    } else {
      const borrowDate = new Date(formData.borrowDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset hours for comparison

      if (borrowDate > today) {
        // Permettre les dates futures (emprunts programmés)
      } else if (borrowDate < new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        // Empêcher les dates trop anciennes (plus de 30 jours)
        newErrors.borrowDate = 'La date d\'emprunt ne peut pas être antérieure à 30 jours';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCreateRequest = (): BorrowingCreateRequest => {
    if (!formData.selectedMember || !formData.selectedGame) {
      throw new Error('Données manquantes pour créer l\'emprunt');
    }

    if (!currentSeason) {
      throw new Error('Aucune saison active trouvée');
    }

    return {
      id_season: currentSeason.id,
      id_member: formData.selectedMember.id,
      id_game: formData.selectedGame.id,
      borrow_date: formData.borrowDate,
    };
  };

  const reset = () => {
    setFormData({
      selectedMember: null,
      selectedGame: null,
      borrowDate: new Date().toISOString().split('T')[0] || '',
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const canSubmit = (): boolean => {
    return (
      formData.selectedMember !== null &&
      formData.selectedGame !== null &&
      formData.selectedGame.available > 0 &&
      !!formData.borrowDate &&
      !isSubmitting &&
      currentSeason !== null
    );
  };

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateSelectedMember,
    updateSelectedGame,
    updateBorrowDate,
    validateForm,
    getCreateRequest,
    reset,
    canSubmit,
    currentSeason,
  };
};