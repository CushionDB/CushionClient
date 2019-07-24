import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);


class Store {
  constructor() {

    this.localDB = new PouchDB('cushionDB', {skip_setup: true});
    this.listeners = [];

    // this.bindToLocalChange(this.notifyListeners);
  }


  // connectRemoteDB() {
  //   console.log(this.remoteDB.name);
  //   // this.bindToLocalChange(() => {
  //    this.pushToRemoteDB();
  //   // });
  // }

  pushToRemoteDB(){
    PouchDB.replicate(this.localDB.name, this.remoteDB.name);
  }

  pullFromRemoteDB(){
    PouchDB.replicate(this.remoteDB.name, this.localDB.name);
  }

  attachRemoteDB(remoteDb){
    this.remoteDB = remoteDb;
    // this.subscribe(this.pushToRemoteDB);
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
    }).on('change', cb);
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
      return docs.map(doc => {
        const { _rev, ...docWithoutRev} = doc;
        return docWithoutRev;
      });
    }).catch(e => e);
  }

  deleteAll() {
    return this.getAll().then(docs => {
      docs.forEach(doc => doc._deleted = true);
      this.localDB.bulkDocs(docs)
    });
  }

}

export default Store;
