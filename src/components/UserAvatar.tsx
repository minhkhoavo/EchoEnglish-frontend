import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineIndicator?: boolean;
  ringClassName?: string;
}

const sizeClasses = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-9 w-9 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-2xl',
};

const onlineIndicatorSizes = {
  xs: 'w-2 h-2 bottom-0 right-0',
  sm: 'w-3 h-3 bottom-0 right-0',
  md: 'w-3 h-3 bottom-1 right-1',
  lg: 'w-4 h-4 bottom-1 right-1',
  xl: 'w-5 h-5 bottom-1 right-1',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'Avatar',
  fallbackText,
  size = 'md',
  className,
  showOnlineIndicator = false,
  ringClassName = 'ring-4 ring-purple-200',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const shouldShowImage = src && src !== 'string' && !imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitial = () => {
    if (fallbackText) {
      return fallbackText.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className={cn('relative inline-block flex-shrink-0', className)}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size],
            ringClassName
          )}
          onError={handleImageError}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center',
            sizeClasses[size],
            ringClassName
          )}
        >
          <span className="text-white font-semibold">{getInitial()}</span>
        </div>
      )}
      {showOnlineIndicator && (
        <span
          className={cn(
            'absolute bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow z-20',
            onlineIndicatorSizes[size]
          )}
        />
      )}
    </div>
  );
};
