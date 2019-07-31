import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

class Store {
  constructor() {
    this.registerServiceWorker();
    this.localDB = new PouchDB('cushionDB');
    this.listeners = [];
    this.publicVapidKey = 'BCA04yoTGRbqfe__mD3jXmNxYWCKF2jcPY4Kbas7GqV3o7vS43kahAucdIQF_aFix1mCkkGQzRwqob53atFxHJg';

    this.bindToLocalChange(this.notifyListeners);
  }

  subscribeToNotifications() {
    const username = this.remoteDB.__opts.auth.username;

    this.serviceWorkerReady().then(sw => {
      sw.ready.then(reg => {
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array(this.publicVapidKey),
        }).then(subscription => {
          console.log('[SUBSCRIPTION] ', subscription);
          const body = {
            username,
            subscription,
            device: navigator.platform
          };

          fetch('http://localhost:3001/subscribe', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        });
      })
    });
  }

  triggerPushNotification() {
    const data = {
      username: this.remoteDB.__opts.auth.username,
      device: navigator.platform
    };

    fetch('http://localhost:3001/triggerSync', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  connectRemoteDB() {
    this.bindToLocalChange(this.pushToRemoteDB);
  }

  pushToRemoteDB(){
    this.serviceWorkerReady().then(sw => {
      this.postMessage('SCHEDULE_PUSH', {}, sw);
    });
  }

  pullFromRemoteDB(){
    this.serviceWorkerReady().then(sw => {
      this.postMessage('SCHEDULE_PULL', {}, sw);
    });
  }

  attachRemoteDB(remoteDb) {
    this.remoteDB = remoteDb;
    this.connectRemoteDB();
  }

  detachRemoteDB(){
    this.remoteDB = null;
  }

  notifyListeners() {
    this.listeners.forEach(l => l());
  }

  bindToLocalChange(cb) {
    this.localDB.changes({
      live: true,
      since: 'now'
    }).on('change', cb.bind(this));
  }

  subscribe(listener) {
    this.listeners = [...this.listeners, listener];

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    }
  }

  set(document) {
    return this.localDB.post(document)
      .then(doc => doc.id)
      .catch(e => console.log(e));
  }

  find(attribute, value){
    return this.localDB.createIndex({
      index: {fields: [attribute]}
    }).then( res => {
      return this.localDB.find({
        selector: {
          [attribute]: value
        }
      }).then( r =>{
        console.log(r.docs);
        return r.docs;
      }).catch( err => console.log(err) );
    }).catch( err => console.log(err) );
  }

  get(id) {
    return this.localDB.get(id)
      .then(doc => {
      const { _rev, ...docWithoutRev } = doc;

      return docWithoutRev;
    }).catch(e => console.log(e));
  }

  update(id, attrs) {
    return this.localDB.get(id)
      .then(doc => {
        console.log(doc);
        this.localDB.put({
          ...doc,
          ...attrs
        }).then(doc => doc.id)
          .catch(e => console.log(e));
      });
  }

  delete(id) {
    return this.localDB.get(id).then(doc => {
      doc._deleted = true;

      this.localDB.put(doc)
        .then(doc => doc.id)
        .catch(e => console.log(e));
    });
  }

  getAll() {
    return this.localDB.allDocs({
      'include_docs': true,
    }).then(docs => {
      return docs.rows.map(doc => {
        const d = doc.doc;
        delete d._rev;
        return d;
      });
    }).catch(e => e);
  }

  deleteAll() {
    return this.getAll().then(docs => {
      docs.forEach(doc => doc._deleted = true);
      this.localDB.bulkDocs(docs)
    });
  }

  postMessage(id, payload, sw) {
    return new Promise((res, rej) => {
      const msgChannel = new MessageChannel();
      msgChannel.port1.onmessage = (evt) => {
        if (evt.data.error) {
          rej(evt.data.error);
        } else {
          res(evt.data);
        }
      }

      sw.controller.postMessage({ id, payload }, [msgChannel.port2]);
     });
   }

   registerServiceWorker() {
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('../sw.js');
     }
   }

   serviceWorkerReady() {
     if (navigator.serviceWorker.controller) {
       return Promise.resolve(navigator.serviceWorker);
     }

     return new Promise((resolve) => {
       function onControllerChange() {
         navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
         resolve(navigator.serviceWorker);
       }

       navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
     });
   }
}

export default Store;
