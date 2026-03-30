import { NextRequest } from 'next/server';

/**
 * Route Handler: GET /api/weather
 *
 * Actúa como proxy seguro hacia OWM One Call API 3.0.
 * Protege la OWM_API_KEY del lado del servidor y aplica caché agresivo
 * de 30 minutos agrupado por cityKey para optimizar el consumo de cuota.
 *
 * Query params requeridos:
 * - lat: Latitud (número)
 * - lon: Longitud (número)
 * - cityKey: Clave de ciudad normalizada (ej: "bernal-buenos-aires-ar")
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const cityKey = searchParams.get('cityKey');

  if (!lat || !lon || !cityKey) {
    return new Response(
      JSON.stringify({ error: 'Faltan parámetros requeridos: lat, lon, cityKey' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    console.error('[/api/weather] OWM_API_KEY no está configurada en el entorno.');
    return new Response(
      JSON.stringify({ error: 'Configuración del servidor incompleta.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const owmUrl =
    `https://api.openweathermap.org/data/3.0/onecall` +
    `?lat=${lat}&lon=${lon}` +
    `&exclude=minutely,alerts` +
    `&units=metric` +
    `&lang=es` +
    `&appid=${apiKey}`;

  try {
    const res = await fetch(owmUrl, {
      next: {
        revalidate: 1800, // 30 minutos de caché
        tags: [`weather-${cityKey}`], // Permite invalidación por ciudad
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[/api/weather] Error de OWM (${res.status}): ${errorBody}`);
      return new Response(
        JSON.stringify({ error: `Error del proveedor meteorológico: ${res.status}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    return Response.json(data);

  } catch (error: any) {
    console.error('[/api/weather] Error de red:', error.message);
    return new Response(
      JSON.stringify({ error: 'No se pudo conectar con el servicio meteorológico.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
