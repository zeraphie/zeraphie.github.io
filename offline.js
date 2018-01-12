/*==============================================================================
 Config variables
==============================================================================*/
const cacheName = 'zeraphie-github-io-cache';
const dataCacheName = `data-${cacheName}`;

/*==============================================================================
 Files to cache
==============================================================================*/
let filesToCache = [
    '/css/app.css',
    '/css/ui-experiment.css',
];

/*==============================================================================
 On installing the service worker, open the cache and add all the files to the
 cache
==============================================================================*/
self.addEventListener('install', e => {
    console.log('[ServiceWorker] Install');

    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[ServiceWorker] Caching app shell');
            
            return fetch('/sitemap.json')
                .then(data => data.json())
                .then(links => {
                    console.log(links);

                    return cache.addAll([...filesToCache, ...links]);
                });
        })
    );
});

/*==============================================================================
 On activating the service worker, remove old caches
==============================================================================*/
self.addEventListener('activate', e => {
    console.log('[ServiceWorker] Activate');

    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if(key !== cacheName && key !== dataCacheName){
                    console.log('[ServiceWorker] Removing old cache', key);

                    return caches.delete(key);
                }
            }));
        })
    );

    return self.clients.claim();
});

/*==============================================================================
 Use the cache then network strategy to load the resource
==============================================================================*/
self.addEventListener('fetch', e => {
    /*--------------------------------------
     Guard against extensions
    --------------------------------------*/
    if(e.request.url.indexOf(self.location.origin) === -1){
        return;
    }

    console.log('[ServiceWorker] Fetch', e.request.url);

    e.respondWith(
        caches.open(dataCacheName).then(cache => {
            return fetch(e.request).then(response => {
                cache.put(e.request.url, response.clone());

                return response;
            });
        })
    );
});
