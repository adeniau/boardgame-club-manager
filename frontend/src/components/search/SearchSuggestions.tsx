import React from 'react';
import { 
  MagnifyingGlassIcon, 
  ClockIcon,
  PuzzlePieceIcon as GamepadIcon,
  UserIcon,
  ArchiveBoxIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { SearchSuggestion, SearchHistory } from '../../types/search';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  query: string;
  highlightedIndex: number;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onClose: () => void;
  className?: string;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  history,
  query,
  highlightedIndex,
  onSuggestionClick,
  onClose,
  className = ''
}) => {
  // Helper function to get entity icon
  const getEntityIcon = (entityType?: string) => {
    switch (entityType) {
      case 'game':
        return <GamepadIcon className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <UserIcon className="h-4 w-4 text-green-500" />;
      case 'borrowing':
        return <ArchiveBoxIcon className="h-4 w-4 text-orange-500" />;
      case 'season':
        return <CalendarIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper function to get entity type label
  const getEntityTypeLabel = (entityType?: string) => {
    switch (entityType) {
      case 'game':
        return 'Jeu';
      case 'member':
        return 'Membre';
      case 'borrowing':
        return 'Emprunt';
      case 'season':
        return 'Saison';
      default:
        return '';
    }
  };

  // Helper function to highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="font-semibold text-blue-600">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const hasHistory = history.length > 0;
  const hasSuggestions = suggestions.length > 0;
  const totalItems = history.length + suggestions.length;

  if (!hasHistory && !hasSuggestions) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto ${className}`}>
      {/* Recent Searches */}
      {hasHistory && (
        <div className="border-b border-gray-100">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Recherches récentes
          </div>
          {history.slice(0, 3).map((item, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <button
                key={item.id}
                onClick={() => onSuggestionClick({ text: item.query, type: 'query' })}
                className={`
                  w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 text-left transition-colors
                  ${isHighlighted ? 'bg-blue-50' : ''}
                `}
              >
                <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    {highlightText(item.query, query)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.resultsCount} résultat{item.resultsCount > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Suggestions */}
      {hasSuggestions && (
        <div>
          {hasHistory && (
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Suggestions
            </div>
          )}
          {suggestions.map((suggestion, index) => {
            const actualIndex = hasHistory ? history.length + index : index;
            const isHighlighted = actualIndex === highlightedIndex;
            
            return (
              <button
                key={`suggestion-${index}`}
                onClick={() => onSuggestionClick(suggestion)}
                className={`
                  w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 text-left transition-colors
                  ${isHighlighted ? 'bg-blue-50' : ''}
                `}
              >
                {getEntityIcon(suggestion.entityType)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    {highlightText(suggestion.text, query)}
                  </div>
                  {suggestion.entityType && (
                    <div className="text-xs text-gray-500">
                      {getEntityTypeLabel(suggestion.entityType)}
                      {suggestion.count && ` • ${suggestion.count} résultat${suggestion.count > 1 ? 's' : ''}`}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2">
        <div className="text-xs text-gray-500 text-center">
          Utilisez ↑ ↓ pour naviguer, ↵ pour sélectionner, Échap pour fermer
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;