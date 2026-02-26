'use server';

// Caché en memoria simple para resultados de IA (Persiste mientras el proceso de Vercel esté caliente)
const aiCache = new Map<string, string>();

/**
 * Server Action que genera una imagen de fondo para una ciudad y clima específicos
 * utilizando Google AI (Gemini / Imagen 4) con API Key.
 * 
 * Versión de Velocidad Extrema: Imagen 4 Fast, JPEG Quality 40, Prompt Minimalista y Caché.
 */
export async function generateCityBackgroundAction(city: string, weatherDescription: string): Promise<{ imageUrl: string; cached: boolean }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("[AI Server Action] Error: No se encontró GEMINI_API_KEY en las variables de entorno.");
        return { imageUrl: "", cached: false };
    }

    // Normalizar clave de caché
    const cacheKey = `${city.toLowerCase()}_${weatherDescription.toLowerCase()}`;
    if (aiCache.has(cacheKey)) {
        console.log(`[AI Server Action] Cache Hit (In-Memory) para: ${cacheKey}`);
        return { imageUrl: aiCache.get(cacheKey)!, cached: true };
    }

    console.log(`[AI Server Action] Generando imagen ultra-rápida para: ${city}, ${weatherDescription}`);

    try {
        const modelId = "imagen-4.0-fast-generate-001";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;

        // Prompt enriquecido para bloquear texto y requerir estilo FullHD fotorealista
        const prompt = `Photorealistic background landscape of ${city} with ${weatherDescription}, cinematic view, 1080p resolution. IMPORTANT: Absolutely NO text, NO words, NO letters, NO watermarks, NO city names, NO fonts.`;

        const payload = {
            instances: [{ prompt: prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "16:9",
                outputOptions: {
                    mimeType: "image/jpeg",
                    compressionQuality: 65 // Compresión balanceada para FullHD ligero (~150-250kb)
                }
            }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[AI Server Action] Google AI Error:", response.status, JSON.stringify(errorData));
            throw new Error(`Google AI respondió con error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.predictions || data.predictions.length === 0) {
            throw new Error("La API no devolvió ninguna imagen.");
        }

        const base64Image = data.predictions[0].bytesBase64Encoded;
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        // Guardar en caché
        aiCache.set(cacheKey, imageUrl);

        console.log(`[AI Server Action] ¡Imagen instantánea generada con éxito para ${city}!`);

        return {
            imageUrl,
            cached: false
        };

    } catch (error: any) {
        console.error("[AI Server Action] Error global:", error.message || error, error.cause || '');
        return { imageUrl: "", cached: false };
    }
}
