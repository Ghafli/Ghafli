const CACHE_NAME = 'flashcard-app-v1';
const DYNAMIC_CACHE = 'flashcard-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.php',
    '/css/styles.css',
    '/js/app.js',
    '/js/services/FlashcardService.js',
    '/js/services/SpacedRepetitionService.js',
    '/js/services/ProgressService.js',
    '/js/services/CustomizationService.js',
    '/js/services/NotificationService.js',
    '/js/components/FlashcardStudy.js',
    '/js/components/WritingMode.js',
    '/js/components/QuizMode.js',
    '/offline.html',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
                        .map(key => caches.delete(key))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - handle offline requests
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        return event.respondWith(handleApiRequest(event.request));
    }

    // Handle static assets
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(fetchResponse => {
                        // Cache dynamic assets
                        return caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(event.request.url, fetchResponse.clone());
                                return fetchResponse;
                            });
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        return null;
                    });
            })
    );
});

// Handle API requests
async function handleApiRequest(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            // Cache successful API responses
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(request.url, response.clone());
            return response;
        }
    } catch (error) {
        // Return cached API response if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Store failed request in IndexedDB for later sync
        await storeFailedRequest(request);
    }

    return new Response(
        JSON.stringify({ error: 'Currently offline' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
}

// Background sync event
self.addEventListener('sync', event => {
    if (event.tag === 'sync-flashcards') {
        event.waitUntil(syncData());
    }
});

// Push notification event
self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: data.data
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
