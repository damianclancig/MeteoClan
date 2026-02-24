'use server';

/**
 * Server Action que genera una imagen de fondo para una ciudad y clima específicos
 * utilizando Google AI (Gemini / Imagen 4) con API Key.
 * 
 * Versión Optimizada: Usa Imagen 4 Fast y compresión JPEG para carga ultra rápida.
 */
export async function generateCityBackgroundAction(city: string, weatherDescription: string): Promise<{ imageUrl: string; cached: boolean }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("[AI Server Action] Error: No se encontró GEMINI_API_KEY en las variables de entorno.");
        return { imageUrl: "", cached: false };
    }

    console.log(`[AI Server Action] Generando imagen para: ${city}, ${weatherDescription} usando Gemini API Key (Imagen 4 Fast)`);

    try {
        // Optimizamos para velocidad: usamos el modelo "Fast" y formato JPEG con compresión
        const modelId = "imagen-4.0-fast-generate-001";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;

        const prompt = `A cinematic photography of ${city} with ${weatherDescription}, professional lighting, landscape orientation, no text.`;

        const payload = {
            instances: [{ prompt: prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "16:9",
                outputOptions: {
                    mimeType: "image/jpeg",
                    compressionQuality: 60 // Calidad moderada para carga ultra rápida (< 200kb)
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

        // La respuesta viene en Base64
        const base64Image = data.predictions[0].bytesBase64Encoded;
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        console.log(`[AI Server Action] ¡Imagen optimizada generada con éxito para ${city}!`);

        return {
            imageUrl,
            cached: false
        };

    } catch (error: any) {
        console.error("[AI Server Action] Error global:", error.message || error, error.cause || '');

        // Fallback: Si falla la generación por IA, devolvemos vacío para usar el gradiente CSS.
        return { imageUrl: "", cached: false };
    }
}
