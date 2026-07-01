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
