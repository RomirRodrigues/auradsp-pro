const CACHE_NAME = 'auradsp-pro-v1.3.0';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/app.js',
  './js/audio/audio-engine.js',
  './js/data/presets.js',
  './js/visual/spatial-canvas.js',
  './js/visual/visualizer.js',
  './js/dsp/meter-worklet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
