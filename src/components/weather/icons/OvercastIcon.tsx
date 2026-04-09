import React from 'react';

interface OvercastIconProps {
  className?: string;
}

/**
 * OvercastIcon - v1.00
 * Efecto de Paralaje Elíptico de doble capa para cielos totalmente cubiertos.
 */
export const OvercastIcon: React.FC<OvercastIconProps> = ({ className = "w-24 h-24 md:w-32 md:h-32" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-1000`}>
      <style>{`
        @keyframes overcastLayer1 {
          0% { transform: translateX(-15%) translateY(-5%) scale(1.1); }
          50% { transform: translateX(10%) translateY(5%) scale(1.05); }
          100% { transform: translateX(-15%) translateY(-5%) scale(1.1); }
        }
        @keyframes overcastLayer2 {
          0% { transform: scaleX(-1) translateX(12%) translateY(5%); }
          50% { transform: scaleX(-1) translateX(-8%) translateY(-5%); }
          100% { transform: scaleX(-1) translateX(12%) translateY(5%); }
        }
      `}</style>

      {/* Aura gris atmosférica para profundidad */}
      <div className="absolute inset-0 bg-slate-500/20 blur-3xl rounded-full" />

      {/* Capa Trasera (z-0) - Más oscura y borrosa */}
      <img
        src="/assets/weather/cloudy_02.webp"
        alt="Cielo cubierto fondo"
        className="absolute h-auto object-contain z-0 opacity-60"
        style={{
          animation: 'overcastLayer1 15s ease-in-out infinite',
          width: '280%',
          minWidth: '280%',
          bottom: '0%',
          left: '-40%',
          filter: 'brightness(0.6) blur(2px) drop-shadow(0 0 20px rgba(0,0,0,0.5))'
        }}
      />

      {/* Capa Frontal (z-10) - Principal, invertida horizontalmente */}
      <img
        src="/assets/weather/cloudy_02.webp"
        alt="Totalmente nublado"
        className="absolute h-auto object-contain z-10 opacity-85"
        style={{
          animation: 'overcastLayer2 10s ease-in-out infinite',
          width: '250%',
          minWidth: '250%',
          bottom: '-20%',
          left: '-30%',
          filter: 'brightness(0.9) drop-shadow(0 10px 30px rgba(0,0,0,0.4))'
        }}
      />
    </div>
  );
};
