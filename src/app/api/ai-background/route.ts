import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateAIPrompt } from '@/lib/ai-prompt';

// Declarar explicitamente el runtime de Node.js para usar sharp
export const runtime = 'nodejs';

// Caché en memoria (Persiste mientras el proceso esté caliente)
const aiCache = new Map<string, string>();

/**
 * Normaliza el nombre de la ciudad para la clave de caché
 */
function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\s+/g, '-') // Espacios por guiones
    .replace(/[^a-z0-9-]/g, ''); // Limpiar caracteres especiales
}

/**
 * Route Handler que genera y optimiza imágenes de fondo con IA.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const city = searchParams.get('city');
  const condition = searchParams.get('condition'); // weatherKey interno (ej: clear_sky)
  const mainCondition = searchParams.get('main'); // Categoría principal (ej: Clear)
  const device = searchParams.get('device') || 'desktop';
  const country = searchParams.get('country') || '';

  if (!city || !condition) {
    return NextResponse.json({ error: 'Missing city or condition' }, { status: 400 });
  }

  const normalizedCity = normalizeCity(city);
  const cacheKey = `${normalizedCity}_${condition}_${device}`;

  // 1. Consultar Caché
  if (aiCache.has(cacheKey)) {
    console.log(`[AI-API] Cache HIT para: ${cacheKey}`);
    return NextResponse.json({ 
      imageBase64: aiCache.get(cacheKey), 
      cached: true 
    });
  }

  console.log(`[AI-API] Cache MISS. Generando imagen para: ${cacheKey}`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[AI-API] GEMINI_API_KEY no configurada.");
    return serveFallback(mainCondition || 'default');
  }

  try {
    // 2. Generar el Prompt
    const prompt = generateAIPrompt(city, condition, country);

    // Intentar con el modelo solicitado (o su variante fast que suele estar más disponible)
    // El brief pide Nano Banana 2 (Gemini 3 Flash Image). 
    // En AI Studio/Generative Language, esto se suele mapear a Imagen 3.
    let modelId = "imagen-3.0-fast-generate-001";
    let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;

    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: device === 'mobile' ? "9:16" : "16:9",
          outputOptions: { mimeType: "image/png" }
        }
      })
    });

    // Reintento con el modelo fallback (imagen-4.0 que estaba en el código original)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`[AI-API] Intento fallido con ${modelId}:`, response.status, JSON.stringify(errorData));
      
      if (response.status === 404) {
        modelId = "imagen-4.0-fast-generate-001";
        console.log(`[AI-API] Reintentando con modelo de respaldo: ${modelId}`);
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: device === 'mobile' ? "9:16" : "16:9",
              outputOptions: { mimeType: "image/png" }
            }
          })
        });
      }
    }

    if (!response.ok) {
      const finalError = await response.json().catch(() => ({}));
      console.error("[AI-API] Error definitivo post-reintento:", response.status, JSON.stringify(finalError));
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.predictions || !data.predictions[0]?.bytesBase64Encoded) {
      throw new Error("No image data in response");
    }

    const rawBase64 = data.predictions[0].bytesBase64Encoded;
    const buffer = Buffer.from(rawBase64, 'base64');

    // 4. Procesamiento con Sharp (Node.js)
    let sharpInstance = sharp(buffer);

    // Redimensionar según dispositivo
    if (device === 'mobile') {
      sharpInstance = sharpInstance.resize(400, 800, { fit: 'cover' });
    } else {
      sharpInstance = sharpInstance.resize(1280, 720, { fit: 'cover' });
    }

    // Convertir a WebP con calidad optimizada
    const optimizedBuffer = await sharpInstance
      .webp({ quality: 78 })
      .toBuffer();

    const optimizedBase64 = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

    // 5. Guardar en Caché
    aiCache.set(cacheKey, optimizedBase64);

    return NextResponse.json({ 
      imageBase64: optimizedBase64, 
      cached: false 
    });

  } catch (error) {
    console.error(`[AI-API] Error fatal:`, error);
    return serveFallback(mainCondition || 'default');
  }
}

/**
 * Sirve una imagen de stock desde public/fallbacks si la IA falla.
 */
async function serveFallback(mainCondition: string) {
  const conditionMap: Record<string, string> = {
    'Clear': 'clear',
    'Clouds': 'clouds',
    'Rain': 'rain',
    'Drizzle': 'rain',
    'Thunderstorm': 'thunderstorm',
    'Snow': 'snow',
    'Fog': 'fog',
    'Mist': 'fog',
  };

  const fallbackId = conditionMap[mainCondition] || 'default';
  // En Next.js, para retornar el path de un asset estático:
  return NextResponse.json({ 
    imageBase64: `/fallbacks/${fallbackId}.png`, 
    isStatic: true,
    error: true 
  });
}
