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
 * Determina si una condición climática debe mostrar el sol/luna (Astro)
 * según la matriz de requerimientos de MeteoClan.
 */
export const hasAstroPresence = (weatherId: number): boolean => {
  const mixedConditions = [
    800, 801, 802,              // Despejado y nubes parciales
    500, 520, 521, 522,         // Lluvias intermitentes
    600, 620, 621, 622          // Nieve intermitente
  ];
  
  return mixedConditions.includes(weatherId);
};

/**
 * Determina si es día o noche basándose en el sufijo del iconCode de OWM
 */
export const isDayTime = (iconCode?: string): boolean => {
  if (!iconCode) return true; // Default a día
  return iconCode.endsWith('d');
};
