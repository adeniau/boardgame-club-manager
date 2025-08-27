import React from 'react';

export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
  height?: string;
  onRetry?: (() => void) | undefined;
}

const ChartSkeleton: React.FC<{ height: string }> = ({ height }) => (
  <div className={`${height} bg-gray-100 rounded-lg animate-pulse flex items-center justify-center`}>
    <div className="text-gray-400">
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
  </div>
);

const ErrorState: React.FC<{ 
  error: string; 
  onRetry?: (() => void) | undefined; 
  height: string;
}> = ({ error, onRetry, height }) => (
  <div className={`${height} bg-red-50 rounded-lg flex items-center justify-center`}>
    <div className="text-center text-red-600">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p className="text-sm font-medium">Erreur de chargement</p>
      <p className="text-xs text-red-500 mt-1">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors duration-200"
        >
          Réessayer
        </button>
      )}
    </div>
  </div>
);

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  loading = false,
  error = null,
  className = '',
  height = 'h-64',
  onRetry,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className={height}>
        {loading ? (
          <ChartSkeleton height={height} />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} height={height} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;