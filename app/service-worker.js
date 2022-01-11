const FILES_TO_CACHE = [
    'index.html',
    'script.js',
    'style.css',
    'model/labels_rus.js',
    'model/labels.js',
    'model/model.json',
    'model/tensorflowjs_model.pb',
    'model/group1-shard1of17',
    'model/group1-shard2of17',
    'model/group1-shard3of17',
    'model/group1-shard4of17',
    'model/group1-shard5of17',
    'model/group1-shard6of17',
    'model/group1-shard7of17',
    'model/group1-shard8of17',
    'model/group1-shard9of17',
    'model/group1-shard10of17',
    'model/group1-shard11of17',
    'model/group1-shard12of17',
    'model/group1-shard13of17',
    'model/group1-shard14of17',
    'model/group1-shard15of17',
    'model/group1-shard16of17',
    'model/group1-shard17of17',
    'images/favicon.ico',
    'images/1024.jpg',
    'fonts/Spartan_1.woff2',
    'fonts/Spartan_2.woff2',
    'fonts/Raleway_1.woff2',
    'fonts/Raleway_2.woff2',
    'tf.min.js',
];

const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';

const limitCacheSize = (name, size) => {
	caches.open(name).then(cache => {
		cache.keys().then(keys => {
		if(keys.length > size){
			cache.delete(keys[0]).then(limitCacheSize(name, size));
		}
		});
	});
};

// install event
self.addEventListener('install', evt => {
//console.log('service worker installed');
evt.waitUntil(
	caches.open(staticCacheName).then((cache) => {
	console.log('caching shell assets');
	cache.addAll(assets);
	})
);
});

// activate event
self.addEventListener('activate', evt => {
//console.log('service worker activated');
evt.waitUntil(
	caches.keys().then(keys => {
	//console.log(keys);
	return Promise.all(keys
		.filter(key => key !== staticCacheName && key !== dynamicCacheName)
		.map(key => caches.delete(key))
	);
	})
);
});

// fetch events
self.addEventListener('fetch', evt => {
if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
	evt.respondWith(
	caches.match(evt.request).then(cacheRes => {
		return cacheRes || fetch(evt.request).then(fetchRes => {
		return caches.open(dynamicCacheName).then(cache => {
			cache.put(evt.request.url, fetchRes.clone());
			// check cached items size
			limitCacheSize(dynamicCacheName, 15);
			return fetchRes;
		})
		});
	}).catch(() => {
		if(evt.request.url.indexOf('.html') > -1){
		return caches.match('/index.html');
		} 
	})
	);
}
});