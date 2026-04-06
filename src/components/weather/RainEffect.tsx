'use client';

import React from 'react';
import styles from '@/styles/RainAnimation.module.css';

interface RainEffectProps {
  pop: number; // Probabilidad de lluvia (valor de 0 a 100)
  className?: string; // Clases opcionales para control de dimensiones desde el padre
}

/**
 * RainEffect - v2.01 (v2.02 adaptado para contenedor de icono)
 * Implementa una animación de lluvia visual basada en una textura WebP.
 * La velocidad escala con la probabilidad de precipitación (pop).
 */
export const RainEffect: React.FC<RainEffectProps> = ({ pop, className = "" }) => {
  // 1. Guardia: Si la probabilidad es baja, no renderizamos nada para ahorrar recursos
  // Nota: Aunque el padre decida llamarlo por weatherCode, respetamos la regla de pop > 15
  if (pop <= 15) return null;

  // 2. Determinar duración de la animación según intensidad
  const getDuration = () => {
    if (pop > 75) return '0.8s';
    if (pop > 40) return '2s';
    return '4s';
  };

  // Determinar tamaño de bucle según pantalla para consistencia (v2.17)
  const [loopSize, setLoopSize] = React.useState(200);

  React.useEffect(() => {
    const handleResize = () => {
      setLoopSize(window.innerWidth < 768 ? 140 : 200);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estilo inline para asegurar que la máscara se aplique y evitar problemas de caché
  const wrapperStyle: React.CSSProperties = {
    WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 95%)',
    maskImage: 'radial-gradient(circle, black 30%, transparent 95%)',
    position: 'absolute',
    inset: 0,
    overflow: 'hidden'
  };

  const baseInnerStyle: any = { // Usamos any para permitir variables CSS custom
    animationDuration: getDuration(),
    // Cuádruple fondo por capa para ultra-densidad (v2.17)
    backgroundImage: "url('/assets/weather/rain.webp'), url('/assets/weather/rain.webp')",
    backgroundRepeat: 'repeat, repeat',
    backgroundPosition: `0 0, 0 ${loopSize / 2}px`, 
    backgroundSize: `${loopSize}px, ${loopSize}px`,
    width: '180%',
    left: '-40%',
    '--rain-loop': `-${loopSize}px` // Variable sincronizada con el CSS v2.17
  };

  return (
    <div className={`${styles.rainWrapper} ${className}`} style={wrapperStyle}>
      {/* Triple Capa Adaptativa (v2.17) */}
      <div className={styles.rainLayer} style={{ ...baseInnerStyle, opacity: 0.6, animationDelay: '0s' }} />
      <div className={styles.rainLayer2} style={{ ...baseInnerStyle, opacity: 0.4, animationDelay: '-1s' }} />
      <div className={styles.rainLayer3} style={{ ...baseInnerStyle, opacity: 0.3, animationDelay: '-2s' }} />
    </div>
  );
};
