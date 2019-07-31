importScripts('src/pouchdb.js');

self.addEventListener('sync', evt => {
  evt.waitUntil(
    getMetaDB().then(doc => {
      let localDBName = doc.cushionLocalDBName;
      let remoteDBAddress = doc.cushionRemoteDBAddress;

      if (evt.tag === 'REPLICATE_TO_SERVER') {
        return pouchSync(remoteDBAddress, localDBName)
      } else if (evt.tag === 'REPLICATE_FROM_SERVER') {
        return pouchSync(remoteDBAddress, localDBName);
      }
    }).catch(err => {
      // Doc does not exist
      console.log('SYNC ERROR', err);
    })
  )
});

self.addEventListener('message', evt => {
  const data = evt.data;

  switch (data.action) {
    case 'SCHEDULE_PUSH':
      self.registration.sync.register('REPLICATE_TO_SERVER');
      return;
    case 'SCHEDULE_PULL':
      self.registration.sync.register('REPLICATE_FROM_SERVER');
      return;
  }
});

self.addEventListener('push', function(event) {
  const data = JSON.parse(event.data.text());
  const title = 'cushionJS';
  const options = {
    body: 'Your data has been synced!',
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  if (data.action === 'SYNC') {
    event.waitUntil(
      getMetaDB().then(doc => {
        let localDBName = doc.cushionLocalDBName;
        let remoteDBAddress = doc.cushionRemoteDBAddress;

        return Promise.all([
          pouchSync(remoteDBAddress, localDBName),
          self.registration.showNotification(title, options)
        ]);
      })
    );
  }
});

function getMetaDB() {
  const cushionMeta = new PouchDB('cushionMeta');
  return cushionMeta.get('cushionMeta');
}

function pouchSync(fromDB, toDB) {
  return new PouchDB(fromDB).replicate.to(toDB);
  // return new Promise((res, rej) => {
  //   PouchDB.replicate(fromDB, toDB)
  //          .on('complete', () => {
  //            res();
  //          }).on('error', err => {
  //            console.log('REP ERR', err);
  //          });
  // });
}
