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
