import React from 'react';

interface PartlyCloudyIconProps {
  className?: string;
}

/**
 * PartlyCloudyIcon - v1.00
 * Composición 3D de Sol y Nube con animaciones de paralaje y rotación.
 */
export const PartlyCloudyIcon: React.FC<PartlyCloudyIconProps> = ({ className = "w-24 h-24 md:w-32 md:h-32" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 ease-in-out`}>
      <style>{`
        @keyframes cloudPan {
          0% { transform: translateX(-12%); }
          100% { transform: translateX(12%); }
        }
      `}</style>
      
      {/* Brillo ambiental fusionado */}
      <div className="absolute inset-0 bg-yellow-400/10 blur-3xl rounded-full" />
      
      {/* Sol Girando en el fondo */}
      <img 
        src="/assets/weather/sunny.webp" 
        alt="Sol de fondo" 
        className="absolute w-full h-full object-contain drop-shadow-lg z-0"
        style={{ 
          animation: 'spin 20s linear infinite',
          transformOrigin: 'center'
        }}
      />
      
      {/* Nube con paneo horizontal */}
      <img 
        src="/assets/weather/cloudy.webp" 
        alt="Nubes superpuestas" 
        className="absolute w-[130%] h-auto object-contain drop-shadow-2xl z-10 opacity-85"
        style={{
          animation: 'cloudPan 7s ease-in-out infinite alternate',
          bottom: '0%', 
          left: '-15%'
        }}
      />
    </div>
  );
};
