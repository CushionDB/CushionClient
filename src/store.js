import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

class Store {
  constructor() {
    this.registerServiceWorker();
    this.localDB = new PouchDB('cushionDB');
    this.listeners = [];

    this.bindToLocalChange(this.notifyListeners);
  }

  connectRemoteDB() {
    console.log('[connectRemoteDB] ', 'called');
    this.bindToLocalChange(this.pushToRemoteDB);
  }

  pushToRemoteDB(){
    console.log('[pushToRemoteDB] ', 'called');
    this.serviceWorkerReady().then(sw => {
      let payload = {
        remoteDBAddress: this.remoteDB.name,
        localDBName: this.localDB.name
      }
      this.postMessage('SCHEDULE_REPLICATION', payload, sw);
    });
  }

  pullFromRemoteDB(){
    PouchDB.replicate(this.remoteDB.name, this.localDB.name);
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

  postMessage(action, payload, sw) {
    return new Promise((res, rej) => {
      const msgChannel = new MessageChannel();
      msgChannel.port1.onmessage = (evt) => {
        if (evt.data.error) {
          rej(evt.data.error);
        } else {
          res(evt.data);
        }
      }

      console.log('[sw] ', sw);
      sw.controller.postMessage({ action, payload }, [msgChannel.port2]);
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
