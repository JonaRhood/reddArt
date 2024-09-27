// Mapa para almacenar AbortControllers para solicitudes de imágenes
let imageAbortControllers = new Map();

// Escuchar el evento 'fetch' para interceptar las solicitudes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Solo aplicar el controlador de aborto a las solicitudes de imágenes
  if (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.webp')) {
    const controller = new AbortController();
    const signal = controller.signal;
    imageAbortControllers.set(event.request.url, controller);

    event.respondWith(
      fetch(event.request, { signal }).then(response => {
        // Eliminar el controlador de aborto después de la respuesta
        imageAbortControllers.delete(event.request.url);
        return response;
      }).catch(err => {
        if (err.name === 'AbortError') {
          console.log('Request aborted:', event.request.url);
          return new Response('', { status: 499, statusText: 'Request Aborted' });
        }
        throw err;
      })
    );
  } else {
    // Si no es una solicitud de imagen, dejar que pase normalmente
    event.respondWith(fetch(event.request));
  }
});

// Escuchar mensajes desde el frontend
self.addEventListener('message', (event) => {
  if (event.data.action === 'cancelPendingRequests') {
    // Abortar todas las solicitudes activas de imágenes
    imageAbortControllers.forEach((controller, url) => {
      controller.abort();
      console.log('Aborted request for image:', url);
    });

    // Limpiar el mapa después de abortar todas las solicitudes
    imageAbortControllers.clear();
  }
});
