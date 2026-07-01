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


/**
 * @fileOverview Visual componente del fondo meteorológico con orquestación asíncrona.
 * Soporta Suspense y renderizado fluido.
 */

import NextImage from 'next/image';
import { cn } from '@/lib/utils';

interface WeatherBackgroundProps {
  imageBase64: string;
  isBackgroundLoading: boolean;
  location?: string;
  description?: string;
  main?: string;
  t: (key: string) => string;
}

/**
 * Componente de presentación para el fondo.
 * Puede ser utilizado dentro de un Suspense o con estados de carga manuales.
 */
export function WeatherBackgroundVisual({ 
  imageBase64, 
  isBackgroundLoading, 
  location, 
  description, 
  main,
  t 
}: WeatherBackgroundProps) {
  
  return (
    <div className="fixed inset-0 z-0 bg-background overflow-hidden">
      {/* 1. Capa de Skeleton / Gradiente Dinámico */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br",
          isBackgroundLoading ? "opacity-100 animate-pulse" : "opacity-0",
          main === 'Clear' ? "from-amber-400 to-blue-500" :
          main === 'Clouds' ? "from-gray-400 to-slate-600" :
          main === 'Rain' ? "from-blue-700 to-slate-900" :
          main === 'Thunderstorm' ? "from-purple-900 to-black" :
          main === 'Snow' ? "from-blue-100 to-white" :
          "from-slate-700 to-slate-900"
        )}
      />

      {/* 2. Imagen Final (IA u Optimizada) con Fade-in */}
      {imageBase64 && (
        <NextImage
          src={imageBase64}
          alt={
            location
              ? `${t('weatherBackgroundFor')} ${location} - ${t(`weather.${description}`)}`
              : 'Weather background'
          }
          fill
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            isBackgroundLoading ? "opacity-0" : "opacity-100"
          )}
          priority
          unoptimized={imageBase64.startsWith('data:')}
        />
      )}

      {/* 3. Capa de oscurecimiento para lectura */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
