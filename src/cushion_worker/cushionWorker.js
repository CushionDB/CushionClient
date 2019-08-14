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
    let localDBName = doc.cushionLocalDBName;
    let remoteDBAddress = doc.cushionRemoteDBAddress;

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
    const localDBName = doc.cushionLocalDBName;
    const remoteDBAddress = doc.cushionRemoteDBAddress;
    const subscribedToPush = doc.subscribedToPush;

    return cushionWorker.pouchSync(remoteDBAddress, localDBName)

    .then(() => {
      if (subscribedToPush) {
        // TRIGGER PUSH NOTIFICATION
      }

      return Promise.resolve();
    });
  })

  .catch(err => console.log(err))
});

cushionWorker.addSyncEvent('REPLICATE_FROM_SERVER', () => {
  return cushionWorker.getMetaDB()

  .then(doc => {
    const localDBName = doc.cushionLocalDBName;
    const remoteDBAddress = doc.cushionRemoteDBAddress;

    return cushionWorker.pouchSync(localDBName, remoteDBAddress);
  })

  .catch(err => console.log(err));
});
