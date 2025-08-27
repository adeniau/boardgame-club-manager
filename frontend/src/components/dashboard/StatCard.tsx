import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  loading?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

const iconColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'blue',
  loading = false,
  variant = 'default',
  className = '',
}) => {
  const isCompact = variant === 'compact';
  const cardPadding = isCompact ? 'p-4' : 'p-6';
  const iconSize = isCompact ? 'w-6 h-6' : 'w-8 h-8';
  const iconContainerSize = isCompact ? 'w-6 h-6' : 'w-8 h-8';
  const titleSize = isCompact ? 'text-xs' : 'text-sm';
  const valueSize = isCompact ? 'text-lg' : 'text-2xl';

  return (
    <div className={`bg-white rounded-lg shadow-sm ${cardPadding} border border-gray-200 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`${iconContainerSize} ${iconColorClasses[iconColor]} rounded-lg flex items-center justify-center`}>
            <div className={`${iconSize.replace('w-', 'w-').replace('h-', 'h-').replace('8', '5').replace('6', '4')}`}>
              {icon}
            </div>
          </div>
        </div>
        <div className={`${isCompact ? 'ml-3' : 'ml-4'}`}>
          <p className={`${titleSize} font-medium text-gray-600`}>{title}</p>
          <p className={`${valueSize} font-semibold text-gray-900`}>
            {loading ? (
              <div className={`animate-pulse ${valueSize === 'text-2xl' ? 'h-8 w-12' : 'h-6 w-10'} bg-gray-200 rounded`}></div>
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;