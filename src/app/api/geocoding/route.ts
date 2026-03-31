import { NextRequest } from 'next/server';

/**
 * Route Handler: GET /api/geocoding
 *
 * Actúa como proxy seguro hacia OWM Geocoding API.
 * Soporta dos modos:
 * - Reverse geocoding: ?lat=X&lon=Y (obtiene ciudad desde coordenadas GPS)
 * - Direct geocoding: ?q=query&limit=5 (búsqueda de ciudades por texto)
 *
 * Aplica caché de 24 horas (los resultados de geocoding cambian raramente).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const q = searchParams.get('q');
  const limit = searchParams.get('limit') ?? '5';

  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    console.error('[/api/geocoding] OWM_API_KEY no está configurada en el entorno.');
    return new Response(
      JSON.stringify({ error: 'Configuración del servidor incompleta.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // MASKED LOG PARA VALIDAR LA CLAVE EN VERCEL
  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`[/api/geocoding] API Key Info - Length: ${apiKey.length} | Mask: ${maskedKey}`);

  let owmUrl: string;

  if (lat && lon) {
    // Modo: Reverse geocoding (GPS → ciudad)
    owmUrl =
      `https://api.openweathermap.org/geo/1.0/reverse` +
      `?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
  } else if (q) {
    // Modo: Direct geocoding (texto → ciudades)
    owmUrl =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(q)}&limit=${limit}&appid=${apiKey}`;
  } else {
    return new Response(
      JSON.stringify({ error: 'Se debe proporcionar lat+lon o q como parámetro.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const res = await fetch(owmUrl, {
      next: { revalidate: 86400 }, // 24 horas de caché
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[/api/geocoding] Error de OWM (${res.status}): ${errorBody}`);
      return new Response(
        JSON.stringify({ error: `Error del servicio de geocoding: ${res.status}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    return Response.json(data);

  } catch (error: any) {
    console.error('[/api/geocoding] Error de red:', error.message);
    return new Response(
      JSON.stringify({ error: 'No se pudo conectar con el servicio de geocoding.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
