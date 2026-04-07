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
          0% { transform: translateX(-12%) translateY(0%); }
          100% { transform: translateX(12%) translateY(2%); }
        }
        @keyframes cloudPanAlt {
          0% { transform: scaleX(-1) translateX(8%) translateY(0%); }
          100% { transform: scaleX(-1) translateX(-8%) translateY(-3%); }
        }
      `}</style>

      {/* Brillo ambiental fusionado */}
      <div className="absolute inset-0 bg-yellow-400/10 blur-3xl rounded-full" />

      {/* Sol Girando en el fondo (z-0) */}
      <img
        src="/assets/weather/sunny.webp"
        alt="Sol de fondo"
        className="absolute w-full h-full object-contain drop-shadow-lg z-0"
        style={{
          animation: 'spin 20s linear infinite',
          transformOrigin: 'center'
        }}
      />

      {/* Nube Posterior (Segunda copia - z-5) */}
      <img
        src="/assets/weather/cloudy_02.webp"
        alt="Nube decorativa"
        className="absolute h-auto object-contain drop-shadow-xl z-[5] opacity-50"
        style={{
          animation: 'cloudPanAlt 10s ease-in-out infinite alternate',
          bottom: '-10%',
          left: '-40%',
          width: '200%',
          minWidth: '200%',
          filter: 'brightness(0.9) blur(1px)'
        }}
      />

      {/* Nube Frontal (Principal - z-10) */}
      <img
        src="/assets/weather/cloudy_02.webp"
        alt="Nube principal"
        className="absolute h-auto object-contain drop-shadow-2xl z-10 opacity-80"
        style={{
          animation: 'cloudPan 7s ease-in-out infinite alternate',
          bottom: '-30%',
          left: '-30%',
          width: '250%',
          minWidth: '250%'
        }}
      />
    </div>
  );
};
