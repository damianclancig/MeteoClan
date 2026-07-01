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

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateAIPrompt } from '@/lib/ai-prompt';

// Declarar explicitamente el runtime de Node.js para usar sharp
export const runtime = 'nodejs';

// Caché en memoria (Persiste mientras el proceso esté caliente)
const aiCache = new Map<string, string>();

// Timeout para proveedores externos (ms)
const PROVIDER_TIMEOUT_MS = 20000;

/**
 * Normaliza el nombre de la ciudad para la clave de caché
 */
function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\s+/g, '-')           // Espacios por guiones
    .replace(/[^a-z0-9-]/g, '');   // Limpiar caracteres especiales
}

/**
 * Helper para hacer fetch con timeout configurable.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// ──────────────────────────────────────────────
// PROVEEDOR 1: Google Gemini Imagen
// ──────────────────────────────────────────────

/**
 * Intenta generar una imagen con Gemini Imagen (Google AI).
 * Prueba con imagen-3.0 primero y hace fallback a imagen-4.0 si no está disponible.
 * @returns Buffer crudo de la imagen, o null si falla.
 */
async function tryGeminiImagen(
  prompt: string,
  device: string,
  apiKey: string
): Promise<Buffer | null> {
  const aspectRatio = device === 'mobile' ? '9:16' : '16:9';
  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      outputOptions: { mimeType: 'image/png' },
    },
  });

  const models = ['imagen-3.0-fast-generate-001', 'imagen-4.0-fast-generate-001'];

  for (const modelId of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;
    try {
      const response = await fetchWithTimeout(
        endpoint,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body },
        PROVIDER_TIMEOUT_MS
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[Gemini] ❌ Falló ${modelId} (${response.status}):`, JSON.stringify(errData));
        // Si es 429 (cuota agotada), no tiene sentido intentar el siguiente modelo Gemini
        if (response.status === 429) return null;
        // Si es 404, intenta el siguiente modelo de la lista
        continue;
      }

      const data = await response.json();
      const rawBase64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (!rawBase64) {
        console.warn(`[Gemini] ❌ Respuesta vacía de ${modelId}`);
        continue;
      }

      console.log(`[Gemini] ✅ Imagen generada con ${modelId}`);
      return Buffer.from(rawBase64, 'base64');

    } catch (err) {
      console.warn(`[Gemini] ❌ Error de red con ${modelId}:`, err);
    }
  }

  return null;
}

// ──────────────────────────────────────────────
// PROVEEDOR 2: Hugging Face Inference API
// Modelo: black-forest-labs/FLUX.1-schnell
// ──────────────────────────────────────────────

/**
 * Intenta generar una imagen con Hugging Face (FLUX.1-schnell).
 * Requiere HF_TOKEN en variables de entorno (opcional, pero recomendado para mayor cuota).
 * @returns Buffer crudo de la imagen, o null si falla.
 */
async function tryHuggingFace(
  prompt: string,
  device: string
): Promise<Buffer | null> {
  const hfToken = process.env.HF_TOKEN;
  const width = device === 'mobile' ? 512 : 1280;
  const height = device === 'mobile' ? 896 : 720;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (hfToken) {
    headers['Authorization'] = `Bearer ${hfToken}`;
  }

  try {
    const response = await fetchWithTimeout(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width, height, num_inference_steps: 4 },
        }),
      },
      PROVIDER_TIMEOUT_MS
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[HuggingFace] ❌ Error (${response.status}):`, errText.slice(0, 200));
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      console.warn('[HuggingFace] ❌ Respuesta vacía (0 bytes)');
      return null;
    }

    console.log(`[HuggingFace] ✅ Imagen generada (${arrayBuffer.byteLength} bytes)`);
    return Buffer.from(arrayBuffer);

  } catch (err) {
    console.warn('[HuggingFace] ❌ Error de red:', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// PROVEEDOR 3: Pollinations.ai
// Sin API Key, sin límite de cuota conocido
// ──────────────────────────────────────────────

/**
 * Intenta generar una imagen con Pollinations.ai.
 * No requiere API Key. Usa el modelo FLUX internamente.
 * @returns Buffer crudo de la imagen, o null si falla.
 */
async function tryPollinations(
  prompt: string,
  device: string
): Promise<Buffer | null> {
  const width = device === 'mobile' ? 512 : 1280;
  const height = device === 'mobile' ? 896 : 720;
  const seed = Math.floor(Math.random() * 999999);
  const encodedPrompt = encodeURIComponent(prompt);

  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true&nofeed=true`;

  try {
    const response = await fetchWithTimeout(url, { method: 'GET' }, PROVIDER_TIMEOUT_MS);

    if (!response.ok) {
      console.warn(`[Pollinations] ❌ Error HTTP (${response.status})`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      console.warn(`[Pollinations] ❌ Content-Type inesperado: ${contentType}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      console.warn('[Pollinations] ❌ Respuesta vacía (0 bytes)');
      return null;
    }

    console.log(`[Pollinations] ✅ Imagen generada (${arrayBuffer.byteLength} bytes)`);
    return Buffer.from(arrayBuffer);

  } catch (err) {
    console.warn('[Pollinations] ❌ Error de red:', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// PROCESAMIENTO CON SHARP
// ──────────────────────────────────────────────

/**
 * Optimiza cualquier buffer de imagen (PNG/JPEG) con Sharp y lo convierte a WebP.
 */
async function optimizeWithSharp(buffer: Buffer, device: string): Promise<string> {
  let instance = sharp(buffer);

  if (device === 'mobile') {
    instance = instance.resize(400, 800, { fit: 'cover' });
  } else {
    instance = instance.resize(1280, 720, { fit: 'cover' });
  }

  const optimizedBuffer = await instance.webp({ quality: 78 }).toBuffer();
  return `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
}

// ──────────────────────────────────────────────
// ROUTE HANDLER PRINCIPAL (Orquestador de Cascada)
// ──────────────────────────────────────────────

/**
 * GET /api/ai-background
 * Genera imágenes de fondo climatológicas usando una cascada de proveedores de IA.
 * Cascada: Gemini Imagen → Hugging Face → Pollinations.ai → Fallback estático
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const city          = searchParams.get('city');
  const condition     = searchParams.get('condition'); // weatherKey interno (ej: clear_sky)
  const mainCondition = searchParams.get('main');       // Categoría principal (ej: Clear)
  const device        = searchParams.get('device') || 'desktop';
  const country       = searchParams.get('country') || '';

  if (!city || !condition) {
    return NextResponse.json({ error: 'Missing city or condition' }, { status: 400 });
  }

  const normalizedCity = normalizeCity(city);
  const cacheKey = `${normalizedCity}_${condition}_${device}`;

  // 1. Consultar Caché
  if (aiCache.has(cacheKey)) {
    console.log(`[AI-API] ✅ Cache HIT: ${cacheKey}`);
    return NextResponse.json({ imageBase64: aiCache.get(cacheKey), cached: true });
  }

  console.log(`[AI-API] 🔄 Cache MISS. Iniciando cascada para: ${cacheKey}`);

  // 2. Generar el prompt (compartido por todos los proveedores)
  const prompt = generateAIPrompt(city, condition, country);

  // 3. Cascada de proveedores
  const providers: Array<{
    name: string;
    fn: () => Promise<Buffer | null>;
  }> = [
    {
      name: 'gemini',
      fn: () => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.warn('[Gemini] ⚠️ GEMINI_API_KEY no configurada. Saltando...');
          return Promise.resolve(null);
        }
        return tryGeminiImagen(prompt, device, apiKey);
      },
    },
    {
      name: 'huggingface',
      fn: () => tryHuggingFace(prompt, device),
    },
    {
      name: 'pollinations',
      fn: () => tryPollinations(prompt, device),
    },
  ];

  for (const provider of providers) {
    try {
      const buffer = await provider.fn();

      if (buffer) {
        const optimizedBase64 = await optimizeWithSharp(buffer, device);

        // Guardar en caché (disponible para todos los proveedores)
        aiCache.set(cacheKey, optimizedBase64);

        console.log(`[AI-API] ✅ Imagen final cacheada (provider: ${provider.name})`);
        return NextResponse.json({
          imageBase64: optimizedBase64,
          cached: false,
          provider: provider.name,
        });
      }
    } catch (err) {
      console.error(`[AI-API] ❌ Error inesperado en ${provider.name}:`, err);
    }

    console.log(`[AI-API] ⏭️ Proveedor "${provider.name}" falló. Intentando siguiente...`);
  }

  // 4. Todos los proveedores fallaron → Servir imagen estática
  console.warn('[AI-API] ⚠️ Todos los proveedores IA fallaron. Sirviendo fallback estático.');
  return serveFallback(mainCondition || 'default');
}

// ──────────────────────────────────────────────
// FALLBACK ESTÁTICO
// ──────────────────────────────────────────────

/**
 * Sirve una imagen de stock desde /public/fallbacks/ si todos los proveedores de IA fallan.
 */
async function serveFallback(mainCondition: string) {
  const conditionMap: Record<string, string> = {
    Clear:        'clear',
    Clouds:       'clouds',
    Rain:         'rain',
    Drizzle:      'rain',
    Thunderstorm: 'thunderstorm',
    Snow:         'snow',
    Fog:          'fog',
    Mist:         'fog',
  };

  const fallbackId = conditionMap[mainCondition] || 'default';
  return NextResponse.json({
    imageBase64: `/fallbacks/${fallbackId}.png`,
    isStatic: true,
    provider: 'static-fallback',
  });
}
