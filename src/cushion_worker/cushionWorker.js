import PouchDB from 'pouchdb';
import path from 'path';
import { getConfigObj } from '../utils/configUtils';

const configObj = getConfigObj();
const useIcons = configObj.appPushIcons
const ROOT_DIR = path.dirname(require.main.filename);

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
    console.log('pouchsync Called');
    console.log(fromDB, toDB);
    return new PouchDB(fromDB).replicate.to(toDB).then(res => console.log(res)).catch(err => console.log(err));
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

  triggerPush(username) {
    const data = {
      username: username,
      device: navigator.platform
    };

    return fetch('http://localhost:3001/trigger_update_user_devices', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
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

global.cushionWorker = new CushionWorker();

cushionWorker.addPushEvent('SYNC', (event) => {  
  const title = configObj.appname;
  const options = {
    body: "is updating in the background.",
    silent: true,
    renotify: false
  };

  if (useIcons) {
    options = {
      ...options,
      icon: '.\icons\logo-icon.png',
      badge: '.\icons\logo-badge.png'
    }
  }

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
  let userDoc;
  
  return cushionWorker.getMetaDB()
  .then(doc => {
    userDoc = doc;
    const localDBName = doc.localDBName;
    const remoteDBAddress = doc.remoteDBAddress;

    return cushionWorker.pouchSync(localDBName, remoteDBAddress);
  })

  .then(() => {
    if (userDoc.subscribedToPush) {
      return cushionWorker.triggerPush(userDoc.username);
    }

    return Promise.resolve();
  })

  .catch(err => console.log(err))
});


cushionWorker.addSyncEvent('REPLICATE_FROM_SERVER', () => {
  return cushionWorker.getMetaDB()

    .then(doc => {
      const localDBName = doc.localDBName;
      const remoteDBAddress = doc.remoteDBAddress;

      return cushionWorker.pouchSync(localDBName, remoteDBAddress);
    })

    .catch(err => console.log(err));
});
