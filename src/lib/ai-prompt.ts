
/**
 * @fileOverview Generador de prompts contextuales en inglés para Gemini Flash Image.
 * Mapea las condiciones climáticas de la aplicación a descriptores visuales cinematográficos.
 */

const visualDescriptors: Record<string, string> = {
  // Despejado
  'clear_sky': 'vibrant golden sunlight, crystal clear deep blue sky, vivid and sharp colors, cinematic outdoor lighting',
  'mainly_clear': 'gentle morning sunshine, scattered high wispy clouds, warm and inviting atmosphere',
  
  // Nublado
  'partly_cloudy': 'dramatic play of light and shadow, fluffy cumulus clouds, expansive sky, cinematic depth',
  'overcast': 'thick and moody overcast sky, soft diffused winter light, desaturated muted tones, melancholic atmosphere',
  'fog': 'dense mysterious morning fog, ethereal and ghostly atmosphere, extremely low visibility, soft glowing light',
  
  // Lluvia/Llovizna
  'drizzle_light': 'delicate light drizzle, glistening wet asphalt reflecting city lights, hazy background, cinematic bokeh',
  'drizzle_moderate': 'steady misty rain, damp environment, soft rain textures, peaceful yet gloomy setting',
  'drizzle_dense': 'heavy mist and drizzle, thick atmosphere, blurred horizons, wet surfaces everywhere',
  'rain_slight': 'light rhythmic rain, fresh outdoor scene, small puddles forming, dramatic overcast sky',
  'rain_moderate': 'refreshing moderate rain, distinct rain streaks, vibrant wet reflections, cinematic urban textures',
  'rain_heavy': 'intense heavy rain, dramatic splashing on surfaces, dark stormy sky, powerful water textures',
  'rain_showers_slight': 'passing light rain shower, break in the clouds with some sunlight, wet-dry contrast',
  'rain_showers_moderate': 'active rain showers, moving clouds, dynamic weather atmosphere',
  'rain_showers_violent': 'torrential downpour, chaotic water movement, dark moody cinematic lighting',
  'freezing_rain_light': 'freezing rain, thin glaze of ice on every surface, icy textures, cold grey morning light',
  
  // Nieve
  'snow_fall_slight': 'gentle light snowfall, delicate snowflakes drifting, peaceful winter scene, soft white textures',
  'snow_fall_moderate': 'steady snowfall, accumulation of snow on trees and buildings, cozy winter atmosphere',
  'snow_fall_heavy': 'heavy blizzard-like snowfall, thick white blanket everywhere, dramatic winter lighting',
  'snow_showers_slight': 'brief snow flurries, dynamic winter sky, crisp cold air feeling',
  'snow_showers_heavy': 'intense snow showers, heavy wind-blown snow, powerful winter elements',
  
  // Tormenta
  'thunderstorm_slight_or_moderate': 'distant thunderstorm, dark menacing clouds, occasional lightning flash on the horizon',
  'thunderstorm_with_heavy_hail': 'violent thunderstorm with hail, chaotic weather, dramatic lightning bolts piercing the sky',
};

/**
 * Genera un prompt estructurado en inglés para Gemini Flash Image.
 * 
 * @param location - Nombre de la ciudad/ubicación.
 * @param weatherKey - Clave interna del clima (ej: 'clear_sky').
 * @param country - Opcional, nombre del país.
 * @returns Un prompt detallado para máxima calidad de IA.
 */
export function generateAIPrompt(location: string, weatherKey: string, country?: string): string {
  const descriptor = visualDescriptors[weatherKey] || 'natural outdoor lighting, realistic textures, cinematic composition';
  const place = country ? `${location}, ${country}` : location;

  return `
    [Style: High-end professional landscape photography, 8k resolution, cinematic lighting, photorealistic]
    [Subject: A wide panoramic view of ${place}. Show recognizable local architecture, authentic geography, and TRUE city landmarks.]
    [Weather Condition: Current weather is ${weatherKey.replace(/_/g, ' ')}. ${descriptor}.]
    [Environment: Highly detailed environment, realistic sky, natural reflections on surfaces.]
    [Atmosphere: Evocative and high-quality mood.]
    [IMPORTANT: Absolutely NO text, NO words, NO letters, NO city names, NO watermarks, NO icons on the image.]
  `.trim().replace(/\n\s+/g, ' ');
}
