import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersService } from '../../services/membersService';
import { useMemberForm } from '../../hooks/useMemberForm';
import { useImageUpload } from '../../hooks/useImageUpload';
import ImageUpload from '../ui/ImageUpload';
import ErrorAlert from '../ui/ErrorAlert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { VALIDATION_RULES } from '../../constants/validation';

const AddMemberForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const memberForm = useMemberForm({
    onError: setError
  });

  const imageUpload = useImageUpload({
    onError: setError
  });

  const handleCancel = () => {
    navigate('/members');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberForm.validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      memberForm.setIsSubmitting(true);
      setError('');
      
      const memberData = memberForm.getCreateRequest();
      const newMember = await MembersService.createMember(memberData, imageUpload.file);
      
      setSuccess(VALIDATION_RULES.SUCCESS.MEMBER_CREATED);
      
      // Rediriger vers la page du membre créé après un délai
      setTimeout(() => {
        navigate(`/members/${newMember.id}`);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du membre');
      console.error('Erreur lors de la création du membre:', err);
    } finally {
      memberForm.setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-green-800 mb-2">Membre créé avec succès !</h3>
          <p className="text-green-700">Redirection vers le profil du membre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Ajouter un membre</h1>
          <p className="mt-1 text-sm text-gray-600">
            Remplissez les informations du nouveau membre
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <ErrorAlert 
              message={error} 
              onClose={() => setError('')}
            />
          )}

          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstname"
                  value={memberForm.formData.firstname}
                  onChange={(e) => memberForm.updateField('firstname', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    memberForm.errors.firstname ? 'border-red-300' : ''
                  }`}
                  disabled={memberForm.isSubmitting}
                />
                {memberForm.errors.firstname && (
                  <p className="mt-1 text-sm text-red-600">{memberForm.errors.firstname}</p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  type="text"
                  id="name"
                  value={memberForm.formData.name}
                  onChange={(e) => memberForm.updateField('name', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    memberForm.errors.name ? 'border-red-300' : ''
                  }`}
                  disabled={memberForm.isSubmitting}
                />
                {memberForm.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{memberForm.errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={memberForm.formData.email}
                onChange={(e) => memberForm.updateField('email', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  memberForm.errors.email ? 'border-red-300' : ''
                }`}
                disabled={memberForm.isSubmitting}
              />
              {memberForm.errors.email && (
                <p className="mt-1 text-sm text-red-600">{memberForm.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                Date de naissance *
              </label>
              <input
                type="date"
                id="birth_date"
                value={memberForm.formData.birth_date}
                onChange={(e) => memberForm.updateField('birth_date', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  memberForm.errors.birth_date ? 'border-red-300' : ''
                }`}
                disabled={memberForm.isSubmitting}
              />
              {memberForm.errors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{memberForm.errors.birth_date}</p>
              )}
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
            
            <div>
              <label htmlFor="adress" className="block text-sm font-medium text-gray-700">
                Adresse *
              </label>
              <textarea
                id="adress"
                rows={2}
                value={memberForm.formData.adress}
                onChange={(e) => memberForm.updateField('adress', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  memberForm.errors.adress ? 'border-red-300' : ''
                }`}
                disabled={memberForm.isSubmitting}
              />
              {memberForm.errors.adress && (
                <p className="mt-1 text-sm text-red-600">{memberForm.errors.adress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                  Code postal *
                </label>
                <input
                  type="text"
                  id="postal_code"
                  value={memberForm.formData.postal_code}
                  onChange={(e) => memberForm.updateField('postal_code', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    memberForm.errors.postal_code ? 'border-red-300' : ''
                  }`}
                  disabled={memberForm.isSubmitting}
                  maxLength={5}
                />
                {memberForm.errors.postal_code && (
                  <p className="mt-1 text-sm text-red-600">{memberForm.errors.postal_code}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Ville *
                </label>
                <input
                  type="text"
                  id="city"
                  value={memberForm.formData.city}
                  onChange={(e) => memberForm.updateField('city', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    memberForm.errors.city ? 'border-red-300' : ''
                  }`}
                  disabled={memberForm.isSubmitting}
                />
                {memberForm.errors.city && (
                  <p className="mt-1 text-sm text-red-600">{memberForm.errors.city}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contact</h3>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                type="tel"
                id="phone_number"
                value={memberForm.formData.phone_number}
                onChange={(e) => memberForm.updateField('phone_number', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  memberForm.errors.phone_number ? 'border-red-300' : ''
                }`}
                disabled={memberForm.isSubmitting}
                placeholder="0123456789"
              />
              {memberForm.errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{memberForm.errors.phone_number}</p>
              )}
            </div>

            <div>
              <label htmlFor="discord_tag" className="block text-sm font-medium text-gray-700">
                Discord (optionnel)
              </label>
              <input
                type="text"
                id="discord_tag"
                value={memberForm.formData.discord_tag}
                onChange={(e) => memberForm.updateField('discord_tag', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                disabled={memberForm.isSubmitting}
                placeholder="username#1234"
              />
            </div>
          </div>

          {/* Photo */}
          <ImageUpload
            preview={imageUpload.preview}
            file={imageUpload.file}
            removeImage={imageUpload.removeImage}
            onChange={imageUpload.handleFileChange}
            onRemove={() => imageUpload.handleRemoveImage()}
            onError={setError}
            disabled={memberForm.isSubmitting}
            label="Photo du membre (optionnel)"
          />

          {/* Statut admin */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
            
            <div className="flex items-center">
              <input
                id="admin"
                name="admin"
                type="checkbox"
                checked={memberForm.formData.admin === '1'}
                onChange={(e) => memberForm.updateField('admin', e.target.checked ? '1' : '0')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={memberForm.isSubmitting}
              />
              <label htmlFor="admin" className="ml-2 block text-sm text-gray-900">
                Administrateur
              </label>
            </div>

            {memberForm.formData.admin === '1' && (
              <div>
                <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700">
                  Mot de passe administrateur *
                </label>
                <input
                  type="password"
                  id="admin_password"
                  value={memberForm.formData.admin_password}
                  onChange={(e) => memberForm.updateField('admin_password', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    memberForm.errors.admin_password ? 'border-red-300' : ''
                  }`}
                  disabled={memberForm.isSubmitting}
                />
                {memberForm.errors.admin_password && (
                  <p className="mt-1 text-sm text-red-600">{memberForm.errors.admin_password}</p>
                )}
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={memberForm.isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={memberForm.isSubmitting}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {memberForm.isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              Créer le membre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberForm;