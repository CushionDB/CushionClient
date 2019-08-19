// webpack with pouch

class CushionWorker {
  constructor() {
    this.pushEvents = [];
    this.messageEvents = [];
    this.syncEvents = [];
  }

  getMetaDB() {
    const cushionMeta = new PouchDB('cushionMeta');
    return cushionMeta.get('cushionMeta');
  }

  pouchSync(fromDB, toDB) {
    return new PouchDB(fromDB).replicate.to(toDB);
  }

  pushEventTriggered(evt) {
    const eventData = JSON.parse(evt.data.text());

    return this.triggerEvents(this.pushEvents, eventData.id, evt);
  }

  messageEventTriggered(evt) {
    const eventData = evt.data;

    return this.triggerEvents(this.messageEvents, eventData.id, evt);
  }

  syncEventTriggered(evt) {
    return this.triggerEvents(this.syncEvents, evt.tag, evt);
  }

  addPushEvent(id, evt) {
    this.addEvent(this.pushEvents, id, evt);
  }

  addMessageEvent(id, evt) {
    this.addEvent(this.messageEvents, id, evt);
  }

  addSyncEvent(id, evt) {
    this.addEvent(this.syncEvents, id, evt);
  }

  removePushEvent(id) {
    const oldLength = this.pushEvents.length;
    this.pushEvents = this.pushEvents.filter(e => !e.id === id);

    if (oldLength === this.pushEvents.length) throw new Error('Push event with this ID not found');
  }

  // ADD TO UTILS \/
  triggerEvents(arr, id, evt) {
    return new Promise((res, rej) => {
      arr.forEach(e => {
        if (id === e.id) {
          res(e.evt(evt));
        }
      });

      rej('Event with this ID not found');
    });
  }

  addEvent(arr, id, evt) {
    if (arr.some(e => e.id === id)) throw new Error('Event ID taken');

    arr.push(
      {
        id,
        evt
      }
    );
  }
}

let cushionWorker = new CushionWorker();

cushionWorker.addPushEvent('SYNC', (event) => {  
  const title = 'cushionJS';
  const options = {
    body: 'Your data has been synced!',
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  return cushionWorker.getMetaDB().then(doc => {
    let localDBName = doc.localDBName;
    let remoteDBAddress = doc.remoteDBAddress;

    return Promise.all([
      cushionWorker.pouchSync(remoteDBAddress, localDBName),
      self.registration.showNotification(title, options)
    ]);
  })
});

cushionWorker.addMessageEvent('SCHEDULE_PUSH', () => {
  self.registration.sync.register('REPLICATE_TO_SERVER');
  return Promise.resolve();
});

cushionWorker.addMessageEvent('SCHEDULE_PULL', () => {  
  self.registration.sync.register('REPLICATE_FROM_SERVER');
  return Promise.resolve();
});

cushionWorker.addSyncEvent('REPLICATE_TO_SERVER', () => {
  return cushionWorker.getMetaDB()

  .then(doc => {
    const localDBName = doc.localDBName;
    const remoteDBAddress = doc.remoteDBAddress;
    const subscribedToPush = doc.subscribedToPush;

    return cushionWorker.pouchSync(remoteDBAddress, localDBName)

    .then(() => {
      if (subscribedToPush) {
    cushionWorkerUtils.triggerPush();
        // TRIGGER PUSH NOTIFICATION
      }

      return Promise.resolve();
    });
  })

  .catch(err => console.log(err))
});

  // triggerPushNotification() {
  //   const data = {
  //     username: this.remoteDB.__opts.auth.username,
  //     device: navigator.platform
  //   };

  //   fetch('http://localhost:3001/triggerSync', {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });
  // }

cushionWorker.addSyncEvent('REPLICATE_FROM_SERVER', () => {
  return cushionWorker.getMetaDB()

  .then(doc => {
    const localDBName = doc.localDBName;
    const remoteDBAddress = doc.remoteDBAddress;

    return cushionWorker.pouchSync(localDBName, remoteDBAddress);
  })

  .catch(err => console.log(err));
});
