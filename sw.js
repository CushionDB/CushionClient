importScripts('src/pouchdb.js');

let localDBName;
let remoteDBAddress;

self.addEventListener('sync', evt => {
  if (evt.tag === 'REPLICATE_TO_SERVER') {
    console.log('[SW sync] ', evt);
    evt.waitUntil(pouchPush(localDBName, remoteDBAddress));
  }
});

self.addEventListener('message', evt => {
  const data = evt.data;

  switch (data.action) {
    case 'SCHEDULE_REPLICATION':
      console.log('[SW message] ', data);
      localDBName = data.payload.localDBName;
      remoteDBAddress = data.payload.remoteDBAddress;
      self.registration.sync.register('REPLICATE_TO_SERVER');
      return;
  }
});

function pouchPush(localDBName, remoteDBAddress) {
  console.log('[pouchPush] ', 'called');
  return new Promise((res, rej) => {
    PouchDB.replicate(localDBName, remoteDBAddress)
           .on('complete', () => {
             res();
           });
  });
}
