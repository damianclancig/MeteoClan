import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";

// Inicializar Firebase Admin SDK si no se ha hecho
if (!admin.apps.length) {
    admin.initializeApp();
}

// Instancia de Auth de Google para peticiones internas a Vertex AI
const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
});

export const generateCityBackground = onCall(
    {
        memory: "512MiB",
        timeoutSeconds: 60, // Imagen 3 suele tardar ~10-15s, 60s es un buen margen de seguridad
        region: "us-central1",
        maxInstances: 10,
        invoker: "public",
        cors: ["http://localhost:9002", "https://clima.clancig.com.ar"],
    },
    async (request) => {
        // Al ser una app sin login requerido (pública), omitimos el chequeo de request.auth.
        // Opcionalmente en un futuro, se puede habilitar Firebase App Check para evitar peticiones desde fuera de la app web.

        const { city, weatherDescription } = request.data;
        if (!city || !weatherDescription) {
            throw new HttpsError(
                "invalid-argument",
                "Se requieren los parámetros 'city' y 'weatherDescription'."
            );
        }

        // Normalizamos los strings para crear una clave de caché única y segura para la URL
        const normalizedCity = city.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const normalizedWeather = weatherDescription.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const fileName = `backgrounds/v1/${normalizedCity}_${normalizedWeather}.png`;

        const bucket = admin.storage().bucket();
        const file = bucket.file(fileName);

        try {
            console.log(`[generateCityBackground] Iniciando proceso para: ${city}, ${weatherDescription}`);
            // 1. CACHÉ: Revisar si la imagen ya existe en Firebase Storage
            const [exists] = await file.exists();

            if (exists) {
                const [url] = await file.getSignedUrl({
                    action: "read",
                    expires: "01-01-2100",
                });

                console.log(`[generateCityBackground] Cache Hit: ${fileName}`);
                return { imageUrl: url, cached: true };
            }

            console.log(`[generateCityBackground] Cache Miss: Generando imagen para ${city}...`);

            // 2. GENERACIÓN: Llamada a Vertex AI (Imagen 3)
            console.log(`[generateCityBackground] Obteniendo credenciales de Google Auth...`);
            const projectId = await auth.getProjectId();
            const client = await auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const token = tokenResponse.token;

            console.log(`[generateCityBackground] Llamando a Vertex AI (Proyecto: ${projectId})...`);
            // Importante: Asegúrate de usar la región 'us-central1' para Imagen 3 en Vertex AI
            const location = "us-central1";
            const modelId = "imagen-3.0-generate-002"; // Última versión estable de Imagen 3 para generación
            const endpointRef = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;

            const prompt = `A professional cinematic photography of ${city} with ${weatherDescription}, highly detailed, photorealistic, fullhd resolution, landscape orientation, no text, no watermarks.`;

            const payload = {
                instances: [{ prompt: prompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "16:9", // Orientación horizontal para fondos de apps
                    outputOptions: { mimeType: "image/png" }
                }
            };

            const aiResponse = await fetch(endpointRef, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!aiResponse.ok) {
                const errorText = await aiResponse.text();
                console.error("Vertex AI Error:", errorText);
                throw new Error(`Vertex AI respondió con error: ${errorText}`);
            }

            console.log(`[generateCityBackground] Imagen generada con éxito. Procesando respuesta...`);
            const aiData = await aiResponse.json();

            // La respuesta de Imagen 3 viene en Base64
            const base64Image = aiData.predictions[0].bytesBase64Encoded;

            // 3. ALMACENAMIENTO: Guardar la nueva imagen en Firebase Storage
            console.log(`[generateCityBackground] Guardando imagen en Storage: ${fileName}...`);
            const imageBuffer = Buffer.from(base64Image, 'base64');

            await file.save(imageBuffer, {
                metadata: {
                    contentType: "image/png",
                    cacheControl: "public, max-age=31536000", // Edge Caching por 1 año
                }
            });

            // Hacer archivo público para obtener luego url directo
            await file.makePublic();
            const publicUrl = file.publicUrl();

            console.log(`[generateCityBackground] Completado con éxito: ${publicUrl}`);
            return { imageUrl: publicUrl, cached: false };

        } catch (error: any) {
            console.error("[generateCityBackground] Excepción global:", error);
            // Devolvemos el mensaje de error original para que el usuario pueda verlo en el frontend
            throw new HttpsError("internal", `Error detallado en el servidor: ${error.message || error}`);
        }
    }
);
