import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import * as utils from './utils/storeUtils';
import { scheduleSyncPush } from './utils/swUtils';
import urlB64ToUint8Array from './utils/64to8.js';

// private store properties
let listeners = [];
let metaDB;
let localDB;

const startContReplicationToRemoteDB = (localDB) => {
  utils.bindToChange(localDB, swUtils.scheduleSyncPush);
}

class Store {
  constructor(metaDB) {
    metaDB = metaDB;
    localDB = new PouchDB(metaDB.localDB());

    utils.bindToChange(localDB, utils.notifyListeners(listeners), this);

    if (metaDB.remoteDB()) {
      startContReplicationToRemoteDB(localDB);
    }
    // this.bindToLocalDBChange(this.notifyListeners);
  }

  userSignedIn() {
    startContReplicationToRemoteDB(localDB);
  }

  subscribe(listener) {
    listeners = [
      ...listeners,
      listener
    ];

    return () => {
      listeners = listeners.filter(l => l !== listener);
    }
  }

  set(document) {
    return localDB.post(document)
      .then(doc => doc.id)
      .catch(e => console.log(e));
  }

  get(id) {
    return localDB.get(id)
      .then(doc => {
        const { _rev, ...docWithoutRev } = doc;

        return docWithoutRev;
      }).catch(e => console.log(e));
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

  deleteAll() {
    return localDB.allDocs().then(docs => {
      docs.rows.forEach(doc => doc._deleted = true);
      return localDB.bulkDocs(docs.rows)
    });
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

  destroy(){
    return localDB.destroy()
      .then( resp => resp)
      .catch( err => console.log(err) );
  }
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

export default Store;
