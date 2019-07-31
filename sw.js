importScripts('src/pouchdb.js');

self.addEventListener('sync', evt => {
  const cushionMeta = new PouchDB('cushionMeta');
  cushionMeta.get('cushionMeta')
    .then(doc => {
      let localDBName = doc.cushionLocalDBName;
      let remoteDBAddress = doc.cushionRemoteDBAddress;

      if (evt.tag === 'REPLICATE_TO_SERVER') {
        evt.waitUntil(pouchPush(localDBName, remoteDBAddress));
      } else if (evt.tag === 'REPLICATE_FROM_SERVER') {
        evt.waitUntil(pouchPush(remoteDBAddress, localDBName));
      }
    })
});

self.addEventListener('message', evt => {
  const data = evt.data;

  switch (data.action) {
    case 'SCHEDULE_PUSH':
      console.log('[SW message] ', data);
      self.registration.sync.register('REPLICATE_TO_SERVER');
      return;
    case 'SCHEDULE_PULL':
      self.registration.sync.register('REPLICATE_FROM_SERVER');
      return;
  }
});

self.addEventListener('push', function(event) {
  console.log("[NOTIFICATION DATA] ", event.data.text());
  const data = JSON.parse(event.data.text());

  const title = 'cushionJS';
  const options = {
    body: 'New Message',
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  if (data.action === 'SYNC') {
    self.registration.sync.register('REPLICATE_FROM_SERVER');
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

function pouchPush(localDBName, remoteDBAddress) {
  return new Promise((res, rej) => {
    PouchDB.replicate(localDBName, remoteDBAddress)
           .on('complete', () => {
             res();
           });
  });
}
