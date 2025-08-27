import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useSearch, useSearchSuggestions } from '../../hooks/search';
import { EntityType, SearchSuggestion } from '../../types/search';
import SearchSuggestions from './SearchSuggestions';
import { SearchService } from '../../services/searchService';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (resultId: string, resultType: string) => void;
  entityType?: EntityType;
  showFilters?: boolean;
  showSuggestions?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  redirectOnSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Rechercher des jeux, membres, emprunts...",
  onSearch,
  onResultClick,
  entityType = 'all',
  showFilters = true,
  showSuggestions = true,
  className = '',
  size = 'md',
  autoFocus = false,
  redirectOnSearch = false
}) => {
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>(entityType);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const { suggestions, history, getSuggestions, clearSuggestions } = useSearchSuggestions({
    entityType: selectedEntityType,
    includeHistory: true,
    limit: 8
  });

  // Size classes
  const sizeClasses = {
    sm: {
      input: 'h-8 text-sm px-3',
      button: 'h-8 w-8',
      icon: 'h-4 w-4'
    },
    md: {
      input: 'h-10 text-base px-4',
      button: 'h-10 w-10',
      icon: 'h-5 w-5'
    },
    lg: {
      input: 'h-12 text-lg px-5',
      button: 'h-12 w-12',
      icon: 'h-6 w-6'
    }
  };

  const currentSize = sizeClasses[size];

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    if (showSuggestions) {
      if (value.trim()) {
        getSuggestions(value);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
        clearSuggestions();
      }
    }
    
    setHighlightedIndex(-1);
  }, [getSuggestions, clearSuggestions, showSuggestions]);

  // Handle search submission
  const handleSearch = useCallback((query: string = localQuery) => {
    if (!query.trim()) return;
    
    setShowDropdown(false);
    clearSuggestions();
    
    if (onSearch) {
      onSearch(query);
    }
    
    if (redirectOnSearch) {
      navigate(`/search?q=${encodeURIComponent(query)}&type=${selectedEntityType}`);
    }
  }, [localQuery, onSearch, redirectOnSearch, navigate, selectedEntityType, clearSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.text);
    handleSearch(suggestion.text);
  }, [handleSearch]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalQuery('');
    setShowDropdown(false);
    clearSuggestions();
    inputRef.current?.focus();
  }, [clearSuggestions]);

  // Handle entity type change
  const handleEntityTypeChange = useCallback((newEntityType: EntityType) => {
    setSelectedEntityType(newEntityType);
    if (localQuery.trim() && showSuggestions) {
      getSuggestions(localQuery);
    }
  }, [localQuery, getSuggestions, showSuggestions]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    const totalItems = suggestions.length + (history.length > 0 ? history.length : 0);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < totalItems) {
          const allItems = [...(history.length > 0 ? history.map(h => ({ text: h.query, type: 'query' as const })) : []), ...suggestions];
          const selectedItem = allItems[highlightedIndex];
          if (selectedItem) {
            handleSuggestionClick(selectedItem);
          }
        } else {
          handleSearch();
        }
        break;
        
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showDropdown, suggestions, history, highlightedIndex, handleSuggestionClick, handleSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (showSuggestions && (suggestions.length > 0 || history.length > 0)) {
      setShowDropdown(true);
    }
  }, [showSuggestions, suggestions.length, history.length]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const entityTypeLabels = {
    all: 'Tous',
    games: 'Jeux',
    members: 'Membres',
    borrowings: 'Emprunts',
    seasons: 'Saisons'
  };

  return (
    <div ref={searchBarRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex">
        {/* Entity Type Selector */}
        {showFilters && (
          <div className="relative">
            <select
              value={selectedEntityType}
              onChange={(e) => handleEntityTypeChange(e.target.value as EntityType)}
              className={`${currentSize.input} pl-3 pr-8 bg-white border border-gray-300 border-r-0 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700`}
            >
              {Object.entries(entityTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className={`${currentSize.icon} absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none`} />
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={`
              ${currentSize.input}
              w-full pl-4 pr-20 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${showFilters ? 'rounded-r-lg' : 'rounded-lg'}
            `}
          />

          {/* Clear Button */}
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className={`
                ${currentSize.button}
                absolute right-12 top-1/2 transform -translate-y-1/2
                flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors
              `}
            >
              <XMarkIcon className={currentSize.icon} />
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className={`
              ${currentSize.button}
              absolute right-1 top-1/2 transform -translate-y-1/2
              flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors
            `}
          >
            <MagnifyingGlassIcon className={currentSize.icon} />
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showDropdown && (
        <SearchSuggestions
          suggestions={suggestions}
          history={history}
          query={localQuery}
          highlightedIndex={highlightedIndex}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowDropdown(false)}
          className="absolute top-full left-0 right-0 z-50 mt-1"
        />
      )}
    </div>
  );
};

export default SearchBar;