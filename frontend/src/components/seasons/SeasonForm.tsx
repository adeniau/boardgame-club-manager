import React, { useState } from 'react';
import { CreateSeasonRequest, UpdateSeasonRequest } from '../../types/seasons';
import ErrorAlert from '../ui/ErrorAlert';
import LoadingSpinner from '../ui/LoadingSpinner';

interface SeasonFormProps {
  initialData?: Partial<CreateSeasonRequest>;
  onSubmit: (data: CreateSeasonRequest | UpdateSeasonRequest) => Promise<void>;
  onCancel: () => void;
  submitText: string;
  isEditing?: boolean;
}

const SeasonForm: React.FC<SeasonFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitText,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    start_date: initialData.start_date || '',
    end_date: initialData.end_date || '',
    set_as_current: initialData.set_as_current || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation du nom
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la saison est requis';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    // Validation des dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        newErrors.end_date = 'La date de fin doit être postérieure à la date de début';
      }
    }

    // Validation de la description (optionnelle mais limitée)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Supprimer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Préparer les données selon le mode (création ou modification)
      const submitData: CreateSeasonRequest | UpdateSeasonRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        ...(isEditing ? {} : { set_as_current: formData.set_as_current })
      };

      await onSubmit(submitData);
    } catch (error) {
      setSubmitError('Erreur lors de la soumission du formulaire');
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <ErrorAlert 
          message={submitError} 
          onClose={() => setSubmitError('')}
        />
      )}

      {/* Nom de la saison */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la saison *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : ''
          }`}
          disabled={isSubmitting}
          placeholder="ex: Saison 2024-2025"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none ${
            errors.description ? 'border-red-300' : ''
          }`}
          disabled={isSubmitting}
          placeholder="Description optionnelle de la saison..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/500 caractères
        </p>
      </div>

      {/* Dates de début et de fin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            id="start_date"
            value={formData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.start_date ? 'border-red-300' : ''
            }`}
            disabled={isSubmitting}
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
          )}
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            id="end_date"
            value={formData.end_date}
            onChange={(e) => handleInputChange('end_date', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.end_date ? 'border-red-300' : ''
            }`}
            disabled={isSubmitting}
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Option de saison actuelle (uniquement en création) */}
      {!isEditing && (
        <div className="flex items-center">
          <input
            id="set_as_current"
            name="set_as_current"
            type="checkbox"
            checked={formData.set_as_current}
            onChange={(e) => handleInputChange('set_as_current', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="set_as_current" className="ml-2 block text-sm text-gray-900">
            Définir comme saison actuelle
          </label>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default SeasonForm;