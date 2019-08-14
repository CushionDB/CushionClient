import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import * as envUtils from './utils/envUtils';
import * as urls from './utils/urls';
import * as fetchUtils from './utils/fetchUtils';
import * as swUtils from './utils/swUtils';
import * as utils from './utils/storeUtils';
import urlB64ToUint8Array from './utils/64to8.js';

const PRODUCTION = process.env.NODE_ENV === 'production';
const TESTING = process.env.NODE_ENV === 'testing';

const envVars = envUtils.getEnvVars();

// private store properties
let listeners = [];
let metaDB;
let localDB;

class Store {
  constructor(metaDB) {
    if (!TESTING) this.registerServiceWorker();
    
    metaDB = metaDB;
    localDB = new PouchDB(metaDB.localDB());

    utils.bindToChange(localDB, this.notifyListeners, this);

    if (metaDB.remoteDB()) {
      utils.bindToChange(localDB, swUtils.scheduleSyncPush);
    }
    // this.bindToLocalDBChange(this.notifyListeners);
  }

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
  pushToRemoteDB(){
    this.getServiceWorker().then(sw => {
      this.postMessage('SCHEDULE_PUSH', {}, sw);
    });
  }

  pullFromRemoteDB(){
    this.getServiceWorker().then(sw => {
      this.postMessage('SCHEDULE_PULL', {}, sw);
    });
  }

  startContSyncingToRemoteDB() {

  }

  replicateToRemoteDB() {
    this.bindToLocalDBChange(this.pushToRemoteDB);
  }


  attachRemoteDB(remoteDb) {
    this.remoteDB = remoteDb;
    this.replicateToRemoteDB();
  }

  detachRemoteDB(){
    this.remoteDB = null;
  }

  notifyListeners() {
    listeners.forEach(l => l());
  }

  bindToLocalDBChange(cb) {
    localDB.changes({
      live: true,
      since: 'now'
    }).on('change', cb.bind(this));
  }

  subscribe(listener) {
    listeners = [...listeners, listener];

    return () => {
      listeners = listeners.filter(l => l !== listener);
    }
  }

  set(document) {
    return localDB.post(document)
      .then(doc => doc.id)
      .catch(e => console.log(e));
  }

  find(attribute, value){
    return localDB.createIndex({
      index: {fields: [attribute]}
    }).then( res => {
      return localDB.find({
        selector: {
          [attribute]: value
        }
      }).then( r =>{
        // console.log(r.docs);
        return r.docs;
      }).catch( err => console.log(err) );
    }).catch( err => console.log(err) );
  }

  get(id) {
    return localDB.get(id)
      .then(doc => {
        const { _rev, ...docWithoutRev } = doc;

        return docWithoutRev;
      }).catch(e => console.log(e));
  }

  update(id, attrs) {
    return localDB.get(id)
      .then(doc => {
        // console.log(doc);
        return  localDB.put({
          ...doc,
          ...attrs
        }).then(doc => doc.id)
          .catch(e => console.log(e));
      });
  }

  delete(id) {
    return localDB.get(id).then(doc => {
      doc._deleted = true;

      return  localDB.put(doc)
        .then(doc => doc.id)
        .catch(e => console.log(e));
    });
  }

  getAll() {
    return localDB.allDocs({
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
    return localDB.allDocs().then(docs => {
      docs.rows.forEach(doc => doc._deleted = true);
      return localDB.bulkDocs(docs.rows)
    });
  }

  destroy(){
    return localDB.destroy()
      .then( resp => resp)
      .catch( err => console.log(err) );
  }

  // postMessage(id, payload, sw) {
  //   return new Promise((res, rej) => {
  //     const msgChannel = new MessageChannel();
  //     msgChannel.port1.onmessage = (evt) => {
  //       if (evt.data.error) {
  //         rej(evt.data.error);
  //       } else {
  //         res(evt.data);
  //       }
  //     }

  //     sw.controller.postMessage({ id, payload }, [msgChannel.port2]);
  //   });
  // }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../sw.js');
    }
  }

  
}

export default Store;
