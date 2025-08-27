import React, { useState } from 'react';
import { CurrentBorrowing, ReturnBorrowingFormData } from '../../types/borrowings';
import { BorrowingsService } from '../../services/borrowingsService';
import { GamesService } from '../../services/gamesService';
import { MembersService } from '../../services/membersService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmationModal from '../ui/ConfirmationModal';

interface ReturnBorrowingFormProps {
  borrowing: CurrentBorrowing;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReturnBorrowingForm: React.FC<ReturnBorrowingFormProps> = ({
  borrowing,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ReturnBorrowingFormData>({
    comment: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const calculateBorrowDuration = (): number => {
    const borrow = new Date(borrowing.borrow_date);
    const now = new Date();
    const diffTime = now.getTime() - borrow.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmReturn = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await BorrowingsService.returnBorrowing(
        borrowing.id,
        formData.comment.trim() || undefined
      );
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const duration = calculateBorrowDuration();
  const durationColor = duration <= 7 
    ? 'text-green-600' 
    : duration <= 14 
    ? 'text-yellow-600' 
    : 'text-red-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Retour d'emprunt
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <ErrorAlert 
              message={error} 
              onClose={() => setError(null)} 
            />
          )}

          {/* Détails de l'emprunt */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Détails de l'emprunt</h3>
            
            <div className="flex items-start space-x-4">
              {/* Photo du jeu */}
              <div className="flex-shrink-0">
                <img
                  src={GamesService.getImageUrl(borrowing.game_picture)}
                  alt={borrowing.game_name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>
              
              {/* Informations */}
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {borrowing.game_name}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Membre :</span>
                    <div className="flex items-center mt-1">
                      {borrowing.member_picture && (
                        <img
                          src={MembersService.getImageUrl(borrowing.member_picture)}
                          alt={`${borrowing.member_firstname || ''} ${borrowing.member_lastname || ''}`}
                          className="w-6 h-6 rounded-full object-cover mr-2"
                        />
                      )}
                      <span className="text-gray-900">
                        {borrowing.member_firstname || ''} {borrowing.member_lastname || ''}
                      </span>
                    </div>
                    <div className="text-gray-500 mt-1">{borrowing.member_email || ''}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Durée d'emprunt :</span>
                    <div className={`font-medium ${durationColor} mt-1`}>
                      {duration} jour{duration !== 1 ? 's' : ''}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Emprunté le {new Date(borrowing.borrow_date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                
                {borrowing.member_phone && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Téléphone :</span>
                    <span className="text-gray-900 ml-2">{borrowing.member_phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire de retour */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="Notes sur l'état du jeu, problèmes rencontrés, etc."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.comment.length}/500 caractères
              </div>
            </div>

            {/* Informations de retour */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium text-blue-900">
                    Date de retour : {new Date().toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    Le jeu sera automatiquement marqué comme disponible
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Traitement...</span>
                  </div>
                ) : (
                  'Confirmer le retour'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={showConfirmation}
        title="Confirmer le retour"
        message={`Êtes-vous sûr de vouloir marquer l'emprunt du jeu "${borrowing.game_name}" comme retourné ? Cette action ne peut pas être annulée.`}
        confirmText="Confirmer le retour"
        cancelText="Annuler"
        confirmVariant="success"
        isLoading={isSubmitting}
        onConfirm={handleConfirmReturn}
        onCancel={handleCancelConfirmation}
      />
    </div>
  );
};

export default ReturnBorrowingForm;