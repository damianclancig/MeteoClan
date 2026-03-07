// Universal Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
            function (registration) {
                console.log('Worker registration successful', registration.scope);
            },
            function (err) {
                console.log('Worker registration failed', err);
            }
        );
    });
}
