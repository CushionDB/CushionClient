importScripts('src/cushion_worker/pouchdb.js', 'src/cushion_worker/cushionWorker.js');

self.addEventListener('sync', evt => {
  evt.waitUntil(cushionWorker.syncEventTriggered(evt));
});

self.addEventListener('message', evt => {
  evt.waitUntil(cushionWorker.messageEventTriggered(evt));
});

self.addEventListener('push', evt => {
  evt.waitUntil(cushionWorker.pushEventTriggered(evt));
});
