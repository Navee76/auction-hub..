import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackCategory?: string;
  className?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Auction Lot',
  fallbackCategory,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-purple-50 dark:from-slate-800 dark:to-slate-900 text-slate-400 p-4 text-center select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center mb-2 text-[#7C3AED]">
          <Package className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-1">{alt}</span>
        {fallbackCategory && (
          <span className="text-[11px] text-slate-400 mt-0.5">{fallbackCategory}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
