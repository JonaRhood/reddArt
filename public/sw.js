// Mapa para almacenar AbortControllers para solicitudes
let abortControllers = new Map();

// Escuchar el evento 'install'
self.addEventListener('install', () => {
    console.log('Service worker installed!');
});

// Escuchar el evento 'activate'
self.addEventListener('activate', () => {
    console.log('Service worker activated!');
});

// Interceptar todas las solicitudes
self.addEventListener('fetch', (event) => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Almacenar el controller en el mapa con la URL de la solicitud
    abortControllers.set(event.request.url, controller);

    event.respondWith(
        fetch(event.request, { signal })
            .then(response => {
                // Eliminar el controller después de recibir la respuesta
                abortControllers.delete(event.request.url);
                return response;
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log('Request aborted:', event.request.url);
                    return new Response('', { status: 499, statusText: 'Request Aborted' });
                }
                throw err; // Manejar otros errores
            })
    );
});

// Escuchar mensajes desde el frontend
self.addEventListener('message', (event) => {
    if (event.data.action === 'cancelPendingRequests') {
        console.log("Message received to cancel pending requests");
        
        // Cancelar todas las solicitudes pendientes
        abortControllers.forEach((controller, url) => {
            controller.abort(); // Cancelar la solicitud
            console.log('Aborted request for:', url);
        });

        // Limpiar el mapa después de abortar todas las solicitudes
        abortControllers.clear();
    }
});
