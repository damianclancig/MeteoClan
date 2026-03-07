// Service Worker base mínimo para habilitar PWA A2HS en Android
self.addEventListener('install', (event) => {
    // Para activar el PWA Prompt de inmediato
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Un simple fetch pass-through. Chrome no requiere persistir caché forzosamente hoy en día,
    // pero SÍ requiere un evento 'fetch' interceptado para marcar la web como instalable (PWA)
    event.respondWith(fetch(event.request));
});
