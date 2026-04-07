import React from 'react';
import { SnowyIcon } from '../weather/icons/SnowyIcon';
import { RainyIcon } from '../weather/icons/RainyIcon';
import { FogIcon } from '../weather/icons/FogIcon';

interface WeatherIconResolverProps {
  weatherId: number;
  pop?: number;
  size?: number | string;
  className?: string;
}

/**
 * WeatherIconResolver - Patrón Factory para iconos animados y efectos.
 * Resolvemos Nieve, Lluvia, Tormentas y Niebla/Atmósfera.
 */
export const WeatherIconResolver: React.FC<WeatherIconResolverProps> = ({
  weatherId,
  pop = 100,
  className = ""
}) => {
  // Grupo 7xx: Atmósfera (IDs 701 - 781)
  if (weatherId >= 700 && weatherId < 800) {
    return <FogIcon className={className} />;
  }

  // Grupo 6xx: Nieve (IDs 600 - 622)
  if (weatherId >= 600 && weatherId <= 622) {
    return <SnowyIcon pop={pop} className={className} />;
  }

  // Grupos 2xx, 3xx, 5xx: Lluvia y Tormentas
  if ((weatherId >= 500 && weatherId < 600) ||
    (weatherId >= 300 && weatherId < 400) ||
    (weatherId >= 200 && weatherId < 300)) {
    return (
      <RainyIcon
        pop={pop}
        className={className}
        isThunderstorm={weatherId >= 200 && weatherId < 300}
      />
    );
  }

  return null;
};
