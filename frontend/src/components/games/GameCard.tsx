import { Link } from 'react-router-dom';
import { Game } from '../../types/games';
import { GamesService } from '../../services/gamesService';

interface GameCardProps {
  game: Game;
  onEdit?: (game: Game) => void;
  onDelete?: (game: Game) => void;
  onBorrow?: (game: Game) => void;
  onReturn?: (game: Game) => void;
}

export default function GameCard({ game, onEdit, onDelete, onBorrow, onReturn }: GameCardProps) {
  const imageUrl = GamesService.getImageUrl(game.picture);
  const isAvailable = game.available === 1 || game.available === '1';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <Link to={`/games/${game.id}`} className="block">
          <div className="aspect-w-3 aspect-h-2 rounded-t-lg overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={`Couverture du jeu ${game.name}`}
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-game.jpg';
              }}
            />
          </div>
        </Link>
        
        {/* Badge de disponibilité */}
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isAvailable
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1 ${
                isAvailable ? 'bg-green-400' : 'bg-red-400'
              }`}
              aria-hidden="true"
            />
            {isAvailable ? 'Disponible' : 'Emprunté'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/games/${game.id}`} className="block group">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {game.name}
          </h3>
        </Link>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            to={`/games/${game.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Voir détails
          </Link>

          <div className="flex items-center space-x-2">
            {/* Bouton emprunter - visible seulement si le jeu est disponible et que la fonction est fournie */}
            {onBorrow && isAvailable && (
              <button
                onClick={() => onBorrow(game)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Emprunter le jeu"
                aria-label={`Emprunter le jeu ${game.name}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}

            {/* Bouton rendre - visible seulement si le jeu est emprunté et que la fonction est fournie */}
            {onReturn && !isAvailable && (
              <button
                onClick={() => onReturn(game)}
                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                title="Rendre le jeu"
                aria-label={`Rendre le jeu ${game.name}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 102.828-2.828L8.414 12l3.828-3.828a2 2 0 10-2.828-2.828L3 12z" />
                </svg>
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(game)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Modifier le jeu"
                aria-label={`Modifier le jeu ${game.name}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(game)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Supprimer le jeu"
                aria-label={`Supprimer le jeu ${game.name}`}
                disabled={!isAvailable}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}