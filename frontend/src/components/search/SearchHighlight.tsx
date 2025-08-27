import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
}

const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchTerm,
  className = '',
  highlightClassName = 'font-semibold text-blue-600 bg-yellow-200 px-1 rounded'
}) => {
  if (!text || !searchTerm) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in search term
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark key={index} className={highlightClassName}>
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
};

export default SearchHighlight;