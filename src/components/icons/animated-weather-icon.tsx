/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Moon,
  CloudFog,
  CloudSun,
  Cloudy,
  CloudMoon,
  CloudDrizzle,
  CloudRainWind,
  Snowflake,
  CloudLightning,
  CloudHail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeatherIconResolver } from '@/components/weather-icons/WeatherIconResolver';

interface AnimatedWeatherIconProps {
  code: number; // Acepta tanto códigos WMO como OWM IDs
  className?: string;
  isNight?: boolean;
}

/**
 * Mapeo de OWM weather condition IDs a la configuración de icono+animación.
 * OWM usa IDs numéricos (200-804); WMO usa códigos pequeños (0-99).
 * Esta tabla unifica ambos sistemas.
 */
const iconMap: Map<number, { icon: React.ElementType; animation: string }> = new Map([
  // ── WMO Codes (legacy, mantenidos por compatibilidad) ────────
  [0, { icon: Sun, animation: 'text-yellow-400 animate-[spin_15s_linear_infinite]' }],
  [1, { icon: CloudSun, animation: 'text-yellow-400 animate-pulse' }],
  [2, { icon: CloudSun, animation: 'text-yellow-400 animate-pulse' }],
  [3, { icon: Cloudy, animation: 'text-gray-400 animate-pulse' }],
  [45, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [48, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [51, { icon: CloudDrizzle, animation: 'text-blue-300 animate-pulse' }],
  [53, { icon: CloudDrizzle, animation: 'text-blue-300 animate-pulse' }],
  [55, { icon: CloudRain, animation: 'text-blue-300' }],
  [56, { icon: CloudDrizzle, animation: 'animate-pulse text-white' }],
  [57, { icon: CloudRain, animation: 'animate-pulse text-white' }],
  [61, { icon: CloudRain, animation: 'text-blue-300' }],
  [63, { icon: CloudRain, animation: 'text-blue-300' }],
  [65, { icon: CloudRainWind, animation: 'text-blue-400' }],
  [66, { icon: CloudRain, animation: 'animate-pulse text-white' }],
  [67, { icon: CloudRainWind, animation: 'animate-pulse text-white' }],
  [71, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [73, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [75, { icon: Snowflake, animation: 'animate-pulse text-white' }],
  [77, { icon: Snowflake, animation: 'animate-pulse text-white' }],
  [80, { icon: CloudDrizzle, animation: 'text-blue-300' }],
  [81, { icon: CloudRain, animation: 'text-blue-300' }],
  [82, { icon: CloudRainWind, animation: 'text-blue-400' }],
  [85, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [86, { icon: Snowflake, animation: 'animate-pulse text-white' }],
  [95, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [96, { icon: CloudHail, animation: 'text-yellow-300 animate-pulse' }],
  [99, { icon: CloudHail, animation: 'text-yellow-300 animate-pulse' }],

  // ── OWM IDs (nuevos, desde OWM One Call API 3.0) ─────────────

  // Grupo 800: Cielo despejado
  [800, { icon: Sun, animation: 'text-yellow-400 animate-[spin_15s_linear_infinite]' }],

  // Grupo 80x: Nublado
  [801, { icon: CloudSun, animation: 'text-yellow-400 animate-pulse' }],
  [802, { icon: CloudSun, animation: 'text-gray-300 animate-pulse' }],
  [803, { icon: Cloudy, animation: 'text-gray-400 animate-pulse' }],
  [804, { icon: Cloudy, animation: 'text-gray-400 animate-pulse' }],

  // Grupo 7xx: Atmósfera (niebla, neblina, polvo)
  [701, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [711, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [721, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [731, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [741, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [751, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [761, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [762, { icon: CloudFog, animation: 'animate-pulse text-gray-400' }],
  [771, { icon: Wind, animation: 'text-gray-400 animate-pulse' }],
  [781, { icon: CloudRainWind, animation: 'text-gray-400 animate-pulse' }],

  // Grupo 6xx: Nieve
  [600, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [601, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [602, { icon: Snowflake, animation: 'animate-pulse text-white' }],
  [611, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [612, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [613, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [615, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [616, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [620, { icon: CloudSnow, animation: 'animate-pulse text-white' }],
  [621, { icon: Snowflake, animation: 'animate-pulse text-white' }],
  [622, { icon: Snowflake, animation: 'animate-pulse text-white' }],

  // Grupo 5xx: Lluvia
  [500, { icon: CloudRain, animation: 'text-blue-300' }],
  [501, { icon: CloudRain, animation: 'text-blue-300' }],
  [502, { icon: CloudRainWind, animation: 'text-blue-400' }],
  [503, { icon: CloudRainWind, animation: 'text-blue-400' }],
  [504, { icon: CloudRainWind, animation: 'text-blue-400' }],
  [511, { icon: CloudRain, animation: 'animate-pulse text-white' }],
  [520, { icon: CloudDrizzle, animation: 'text-blue-300' }],
  [521, { icon: CloudRain, animation: 'text-blue-300' }],
  [522, { icon: CloudRainWind, animation: 'text-blue-400' }],
  [531, { icon: CloudRain, animation: 'text-blue-300' }],

  // Grupo 3xx: Llovizna
  [300, { icon: CloudDrizzle, animation: 'text-blue-300 animate-pulse' }],
  [301, { icon: CloudDrizzle, animation: 'text-blue-300 animate-pulse' }],
  [302, { icon: CloudRain, animation: 'text-blue-300' }],
  [310, { icon: CloudDrizzle, animation: 'text-blue-300 animate-pulse' }],
  [311, { icon: CloudDrizzle, animation: 'text-blue-300 animate-pulse' }],
  [312, { icon: CloudRain, animation: 'text-blue-300' }],
  [313, { icon: CloudDrizzle, animation: 'text-blue-300' }],
  [314, { icon: CloudRain, animation: 'text-blue-300' }],
  [321, { icon: CloudDrizzle, animation: 'text-blue-300 animate-pulse' }],

  // Grupo 2xx: Tormenta eléctrica
  [200, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [201, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [202, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [210, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [211, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [212, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [221, { icon: CloudLightning, animation: 'text-yellow-300 animate-pulse' }],
  [230, { icon: CloudHail, animation: 'text-yellow-300 animate-pulse' }],
  [231, { icon: CloudHail, animation: 'text-yellow-300 animate-pulse' }],
  [232, { icon: CloudHail, animation: 'text-yellow-300 animate-pulse' }],
]);

export function AnimatedWeatherIcon({
  code,
  className,
  isNight = false,
}: AnimatedWeatherIconProps) {
  // Overrides nocturnos para cielos despejados / parcialmente nublados
  if (isNight) {
    // OWM IDs
    if (code === 800) return <Moon className={cn('text-slate-300 animate-pulse', className)} />;
    if (code === 801 || code === 802)
      return <CloudMoon className={cn('text-slate-300 animate-pulse', className)} />;
    if (code === 803 || code === 804)
      return <Cloudy className={cn('text-gray-400 animate-pulse', className)} />;
    // WMO codes (fallback)
    if (code === 0) return <Moon className={cn('text-slate-300 animate-pulse', className)} />;
    if (code >= 1 && code <= 2)
      return <CloudMoon className={cn('text-slate-300 animate-pulse', className)} />;
    if (code === 3) return <Cloudy className={cn('text-gray-400 animate-pulse', className)} />;
  }

  const { icon: IconComponent, animation } = iconMap.get(code) ?? {
    icon: Cloud,
    animation: 'animate-pulse',
  };

  return <IconComponent className={cn(animation, className)} />;
}
