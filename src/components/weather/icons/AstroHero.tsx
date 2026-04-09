import React from 'react';

interface AstroHeroProps {
  isDay: boolean;
  className?: string; // Para controlar tamaño y posición desde el padre
}

/**
 * AstroHero - v1.1
 * Representación premium del Sol o la Luna según el momento del día.
 * Utiliza assets WebP de alta fidelidad para Sol y Luna.
 */
export const AstroHero: React.FC<AstroHeroProps> = ({ isDay, className = "w-16 h-16" }) => {
  if (isDay) {
    return (
      <div className={`${className} relative pointer-events-none z-0 flex items-center justify-center`}>
        <img 
          src="/assets/weather/sunny.webp" 
          alt="Sol" 
          className="w-full h-full object-contain"
          style={{ 
            animation: 'spin 15s linear infinite',
            transformOrigin: 'center'
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${className} relative pointer-events-none z-0 flex items-center justify-center`}>
      <img 
        src="/assets/weather/moon.webp" 
        alt="Luna" 
        className="w-full h-full object-contain brightness-110 contrast-110"
        style={{ transform: 'scale(0.7)' }}
      />
    </div>
  );
};
