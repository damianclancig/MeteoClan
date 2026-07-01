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

import React from 'react';
import { SmokeEffect } from '../SmokeEffect';

interface SmokeIconProps {
  className?: string;
  weatherId?: number;
}

/**
 * SmokeIcon - v16.0
 * Icono de Atmósfera Pesada (Humo/Ceniza/Polvo)
 * Utiliza 3 imágenes de humo de forma sinérgica.
 */
export const SmokeIcon: React.FC<SmokeIconProps> = ({ 
  className = "w-24 h-24 md:w-32 md:h-32",
  weatherId
}) => {
  let glowColor = 'bg-slate-600/20'; // Humo estándar
  if (weatherId === 731 || weatherId === 751) {
    glowColor = 'bg-yellow-700/30'; // Arena
  } else if (weatherId === 761 || weatherId === 762) {
    glowColor = 'bg-amber-950/40'; // Polvo/Tierra
  }

  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 overflow-visible`}>
      {/* Sistema Completo de Humo (Capas Múltiples) */}
      <SmokeEffect className="w-full h-full" weatherId={weatherId} />

      {/* Resplandor ovalado (Blur) para coherencia visual dando luz ambiental */}
      <div 
        className={`absolute inset-4 ${glowColor} blur-3xl rounded-full -z-10 pointer-events-none transition-colors duration-1000`} 
        aria-hidden="true"
      />
    </div>
  );
};
