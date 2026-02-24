'use server';

/**
 * Server Action que genera una imagen de fondo para una ciudad y clima específicos
 * utilizando Google AI (Gemini / Imagen 3) con API Key.
 * 
 * Esta versión utiliza el GEMINI_API_KEY de las variables de entorno,
 * eliminando la necesidad de credenciales complejas de Google Cloud.
 */
export async function generateCityBackgroundAction(city: string, weatherDescription: string): Promise<{ imageUrl: string; cached: boolean }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("[AI Server Action] Error: No se encontró GEMINI_API_KEY en las variables de entorno.");
        return { imageUrl: "", cached: false };
    }

    console.log(`[AI Server Action] Generando imagen para: ${city}, ${weatherDescription} usando Gemini API Key`);

    try {
        // Usamos la versión 001 que suele tener mayor disponibilidad en el endpoint de Google AI
        const modelId = "imagen-3.0-generate-001";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;

        const prompt = `A professional cinematic photography of ${city} with ${weatherDescription}, highly detailed, photorealistic, 8k resolution, landscape orientation, no text, no watermarks.`;

        const payload = {
            instances: [{ prompt: prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "16:9",
                outputOptions: { mimeType: "image/png" }
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

            // Si el error es 404, es posible que el modelo Imagen 3 no esté disponible todavía en esa región/API
            // Intentamos un fallback silencioso
            throw new Error(`Google AI respondió con error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.predictions || data.predictions.length === 0) {
            throw new Error("La API no devolvió ninguna imagen.");
        }

        // La respuesta viene en Base64
        const base64Image = data.predictions[0].bytesBase64Encoded;
        const imageUrl = `data:image/png;base64,${base64Image}`;

        console.log(`[AI Server Action] ¡Imagen generada con éxito para ${city}!`);

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
