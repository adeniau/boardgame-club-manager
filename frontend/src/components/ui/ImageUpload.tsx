import React from 'react';

interface ImageUploadProps {
  preview: string;
  file: File | undefined;
  removeImage: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onError: (error: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  preview,
  file,
  removeImage,
  onChange,
  onRemove,
  disabled = false,
  label = "Image (optionnel)",
  className = ""
}) => {
  
  const getRemoveButtonText = () => {
    if (file) return 'Annuler la modification';
    if (removeImage) return 'Annuler la suppression';
    return 'Supprimer l\'image';
  };

  return (
    <div className={className}>
      <label htmlFor="picture" className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
        <div className="space-y-1 text-center">
          {preview ? (
            <div className="space-y-3">
              <img
                src={preview}
                alt="Aperçu"
                className="mx-auto h-32 w-32 object-cover rounded-lg"
              />
              <div className="space-y-2">
                {file && (
                  <p className="text-xs text-blue-600">Nouvelle image sélectionnée</p>
                )}
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                  disabled={disabled}
                >
                  {getRemoveButtonText()}
                </button>
              </div>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="picture"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Télécharger une image</span>
                  <input
                    id="picture"
                    name="picture"
                    type="file"
                    accept="image/*"
                    onChange={onChange}
                    className="sr-only"
                    disabled={disabled}
                  />
                </label>
                <p className="pl-1">ou glissez-déposez</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG jusqu'à 5MB</p>
            </>
          )}
        </div>
      </div>

      {!preview && (
        <div className="mt-2">
          <label
            htmlFor="picture"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Choisir une image
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;