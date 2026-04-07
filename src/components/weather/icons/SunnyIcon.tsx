import React from 'react';

interface SunnyIconProps {
  className?: string;
}

/**
 * SunnyIcon - v1.00
 * Icono solar animado de alto rendimiento usando WebP y CSS.
 */
export const SunnyIcon: React.FC<SunnyIconProps> = ({ className = "w-24 h-24 md:w-32 md:h-32" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 ease-in-out`}>
      {/* Brillo ambiental suave */}
      <div className="absolute inset-0 bg-yellow-400/20 blur-3xl animate-pulse rounded-full" />
      <img 
        src="/assets/weather/sunny.webp" 
        alt="Soleado" 
        className="w-full h-full object-contain drop-shadow-xl z-10"
        style={{ 
          animation: 'spin 10s linear infinite',
          transformOrigin: 'center'
        }}
      />
    </div>
  );
};
