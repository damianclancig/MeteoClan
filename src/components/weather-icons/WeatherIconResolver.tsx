import React from 'react';
import { SnowyIcon } from '../weather/icons/SnowyIcon';
import { RainyIcon } from '../weather/icons/RainyIcon';
import { FogIcon } from '../weather/icons/FogIcon';
import { SmokeIcon } from '../weather/icons/SmokeIcon';
import { AshIcon } from '../weather/icons/AshIcon';

interface WeatherIconResolverProps {
  weatherId: number;
  pop?: number;
  isThunderstorm?: boolean;
  className?: string;
  iconCode?: string;
}

/**
 * WeatherIconResolver - Patrón Factory para iconos animados y efectos.
 * Resolvemos Nieve, Lluvia, Tormentas y Niebla/Atmósfera.
 */
export const WeatherIconResolver: React.FC<WeatherIconResolverProps> = ({
  weatherId,
  pop = 100,
  className = "",
  iconCode
}) => {
  // Grupo 7xx: Atmósfera (IDs 701 - 781)
  if (weatherId >= 700 && weatherId < 800) {
    // 711 (Humo), 731/751 (Arena), 761 (Polvo)
    if ([711, 731, 751, 761].includes(weatherId)) {
      return <SmokeIcon weatherId={weatherId} className={className} />;
    }
    // 762: Ceniza Volcánica -> partículas negras como copos de ceniza
    if (weatherId === 762) {
      return <AshIcon className={className} />;
    }
    // 701 (Mist), 741 (Fog) y el resto caen en niebla normal
    return <FogIcon weatherId={weatherId} className={className} iconCode={iconCode} />;
  }

  // Grupo 6xx: Nieve (IDs 600 - 622)
  if (weatherId >= 600 && weatherId <= 622) {
    return <SnowyIcon pop={pop} weatherId={weatherId} className={className} iconCode={iconCode} />;
  }

  // Grupos 2xx, 3xx, 5xx: Lluvia y Tormentas
  if ((weatherId >= 500 && weatherId < 600) ||
    (weatherId >= 300 && weatherId < 400) ||
    (weatherId >= 200 && weatherId < 300)) {
    return (
      <RainyIcon
        pop={pop}
        weatherId={weatherId}
        className={className}
        isThunderstorm={weatherId >= 200 && weatherId < 300}
        iconCode={iconCode}
      />
    );
  }

  return null;
};
