import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'WeatherWise - Pronóstico del Tiempo con IA',
        short_name: 'WeatherWise',
        description: 'Aplicación del tiempo con pronósticos precisos y fondos generados por IA.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    };
}
