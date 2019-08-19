import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import * as dbUtils from './utils/dbUtils';
import { scheduleSyncPush, scheduleSyncPull } from './utils/swUtils';
import urlB64ToUint8Array from './utils/64to8.js';

// private store properties
let listeners = [];
// let metaDB;
// let dbAuth.localDB;
let dbAuth;

// const startContReplicationToRemoteDB = (localDB) => {
//   dbUtils.bindToChange(localDB, scheduleSyncPush);
// }

const notifyListeners = () => {
  listeners.forEach(l => l()); 
}

class Store {
  constructor(dataAuth) {
    dbAuth = dataAuth;
    // metaDB = metaDB;
    // localDB = new PouchDB(metaDB.localDB());
    dbAuth.bindToLocalDBChange(notifyListeners);
    // dbUtils.bindToChange(localDB, notifyListeners);

    // if (metaDB.remoteDB()) {
    //   startContReplicationToRemoteDB(localDB);
    // }
    // this.bindToLocalDBChange(this.notifyListeners);
  }

  // userSignedIn() {
  //   scheduleSyncPull();
  //   startContReplicationToRemoteDB(localDB);
  // }

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
    return dbAuth.localDB.post(document)
      .then(doc => doc.id)
      .catch(e => console.log(e));
  }

  get(id) {
    return dbAuth.localDB.get(id)
      .then(doc => {
        const { _rev, ...docWithoutRev } = doc;

        return docWithoutRev;
      }).catch(e => console.log(e));
  }

  getAll() {
    return dbAuth.localDB.allDocs({
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
    return dbAuth.localDB.get(id)
      .then(doc => {
        // console.log(doc);
        return  dbAuth.localDB.put({
          ...doc,
          ...attrs
        }).then(doc => doc.id)
          .catch(e => console.log(e));
      });
  }

  delete(id) {
    return dbAuth.localDB.get(id).then(doc => {
      doc._deleted = true;

      return  dbAuth.localDB.put(doc)
        .then(doc => doc.id)
        .catch(e => console.log(e));
    });
  }

  deleteAll() {
    return dbAuth.localDB.allDocs().then(docs => {
      docs.rows.forEach(doc => doc._deleted = true);
      return dbAuth.localDB.bulkDocs(docs.rows)
    });
  }

  find(attribute, value){
    return dbAuth.localDB.createIndex({
      index: {fields: [attribute]}
    }).then( res => {
      return dbAuth.localDB.find({
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
    return dbAuth.localDB.destroy()
      .then( resp => resp)
      .catch( err => console.log(err) );
  }
}


export default Store;
