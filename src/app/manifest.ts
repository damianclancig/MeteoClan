import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'MeteoClan - Pronóstico del Tiempo con IA',
        short_name: 'MeteoClan',
        description: 'Aplicación del tiempo con pronósticos precisos y fondos generados por IA.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#020617', // Slate-950 (matching the app theme)
        theme_color: '#020617',
        icons: [
            {
                src: '/assets/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/assets/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/assets/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        categories: ['weather', 'utilities'],
    };
}
