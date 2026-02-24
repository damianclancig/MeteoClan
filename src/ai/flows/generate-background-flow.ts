'use server';

/**
 * @fileOverview Genkit flow que genera la imagen de fondo del Weather App.
 *
 * Estrategia 1: Unsplash API — Busca fotos reales de la ciudad con clima.
 *               Requiere UNSPLASH_ACCESS_KEY en .env.local
 * Estrategia 2: Picsum.photos — Imágenes aleatorias de alta calidad (CORS OK).
 */

import { ai } from '@/ai/genkit';
import {
  GenerateBackgroundInputSchema,
  type GenerateBackgroundInput,
  GenerateBackgroundOutputSchema,
  type GenerateBackgroundOutput
} from './schemas';


export async function generateBackground(input: GenerateBackgroundInput): Promise<GenerateBackgroundOutput> {
  return generateBackgroundFlow(input);
}


const generateBackgroundFlow = ai.defineFlow(
  {
    name: 'generateBackgroundFlow',
    inputSchema: GenerateBackgroundInputSchema,
    outputSchema: GenerateBackgroundOutputSchema,
  },
  async ({ city, weather, country, adminArea }) => {
    const weatherKeywords: Record<string, string> = {
      'clear_sky': 'sunny clear sky',
      'few_clouds': 'partly cloudy',
      'scattered_clouds': 'cloudy',
      'broken_clouds': 'overcast',
      'shower_rain': 'rain',
      'rain': 'rain',
      'thunderstorm': 'storm lightning',
      'snow': 'snow winter',
      'mist': 'fog mist',
    };

    const weatherKw = weatherKeywords[weather] || weather.replace(/_/g, ' ');

    // STRATEGY 1: Unsplash API — Real city photos with proper CORS
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (UNSPLASH_KEY) {
      try {
        console.log(`[generateBackground] Trying Unsplash API for "${city}"...`);
        const query = encodeURIComponent(`${city} ${weatherKw} cityscape`);
        const apiUrl = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${UNSPLASH_KEY}`;

        const res = await fetch(apiUrl, { next: { revalidate: 0 } });
        if (res.ok) {
          const data = await res.json();
          const imageUrl: string | undefined = data?.urls?.regular;
          if (imageUrl) {
            console.log(`[generateBackground] Unsplash OK: ${imageUrl.substring(0, 60)}...`);
            return { image: imageUrl };
          }
        } else {
          const err = await res.text();
          console.error(`[generateBackground] Unsplash API error ${res.status}: ${err.substring(0, 200)}`);
        }
      } catch (err: any) {
        console.error(`[generateBackground] Unsplash fetch error: ${err.message}`);
      }
    } else {
      console.log('[generateBackground] UNSPLASH_ACCESS_KEY not set, skipping Unsplash.');
    }

    // STRATEGY 2: Picsum.photos — Always works, no key needed, CORS OK
    // The URL is deterministic based on city name for consistency.
    try {
      console.log(`[generateBackground] Using Picsum.photos fallback...`);
      // Use a hash of the city name as seed for a consistent image per city
      const seed = city.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 1000;
      const picsumUrl = `https://picsum.photos/seed/${seed}/1280/720`;
      console.log(`[generateBackground] Picsum URL: ${picsumUrl}`);
      return { image: picsumUrl };
    } catch (err: any) {
      console.error(`[generateBackground] Picsum error: ${err.message}`);
    }

    console.log(`[generateBackground] ALL STRATEGIES FAILED.`);
    return { image: '' };
  }
);
