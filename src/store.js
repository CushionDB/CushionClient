import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import { scheduleSyncPush, scheduleSyncPull } from './utils/swUtils';
import urlB64ToUint8Array from './utils/64to8.js';

let listeners = [];
let dbAuth;

const notifyListeners = () => {
  listeners.forEach(l => l()); 
}

class Store {
  constructor(dataAuth) {
    dbAuth = dataAuth;
    dbAuth.bindToLocalDBChange(notifyListeners);
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
    return dbAuth.localDB.post(document)
    .then(doc => doc.id)
    .catch(err => Promise.reject(err));
  }

  get(id) {
    return dbAuth.localDB.get(id)
    .then(doc => {
      const { _rev, ...docWithoutRev } = doc;

      return docWithoutRev;
    })

    .catch(err => Promise.reject(err));
  }

  getAll() {
    return dbAuth.localDB.allDocs({
      'include_docs': true,
    })

    .then(docs => {
      return docs.rows.map(doc => {
        const { _rev, ...rest } = doc.doc;
        return rest;
      });
    })

    .catch(err => Promise.reject(err));
  }

  update(id, attrs) {
    return dbAuth.localDB.get(id)
    .then(doc => {
      return  dbAuth.localDB.put({
        ...doc,
        ...attrs
      });
    })
    
    .then(doc => doc.id)
    .catch(err => Promise.reject(err));
  }

  delete(id) {
    return dbAuth.localDB.get(id)
    .then(doc => {
      doc._deleted = true;

      return dbAuth.localDB.put(doc)
    })

    .then(doc => doc.id)
    .catch(err => Promise.reject(err));
  }

  deleteAll() {
    return dbAuth.localDB.allDocs({
      include_docs: true
    })

    .then(docs => {
      const deletedDocs = docs.rows.map(row => {
        return {
          _id: row.doc._id,
          _rev: row.doc._rev,
          _deleted: true
        }
      });

      return dbAuth.localDB.bulkDocs(deletedDocs);
    })

    .catch(err => Promise.reject(err));
  }

  find(attribute, value) {
    return dbAuth.localDB.createIndex({
      index: {
        fields: [attribute]
      }
    })

    .then(res => {
      return dbAuth.localDB.find({
        selector: {
          [attribute]: value
        }
      });
    })
    
    .then(r => r.docs)
    .catch(err => Promise.reject(err));
  }

  destroy() {
    return dbAuth.destroyLocal()
    .then(_ => {
      return { status: 'success' };
    })
    
    .catch(err => Promise.reject(err));
  }
}

export default Store;
