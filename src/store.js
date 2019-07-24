import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth);

const TEMP_CONFIG = {
	remoteBaseURL: 'http://localhost:5984/',
}

class Store {
  constructor() {

    this.localDB = new PouchDB('cushionDB', {skip_setup: true});
    this.listeners = [];

    // this.bindToLocalChange(this.notifyListeners);
  }

	getRemoteDB(username, password) {
		const hexUsername = Buffer.from(username, 'utf8').toString('hex');
		const remoteDBAddress = `${TEMP_CONFIG.remoteBaseURL}cushion-${hexUsername}`;

		this.remoteDB = new PouchDB(remoteDBAddress, {skip_setup: true, auth: {username, password}});
	}

  // connectRemoteDB(remoteDB) {
  connectRemoteDB() {
    console.log(this.remoteDB.name);
    // this.bindToLocalChange(() => {
      PouchDB.replicate(this.localDB.name, this.remoteDB.name);
    // });
  }

  // attachRemoteDB(remoteDb){
  //   this.remoteDB = remoteDb;
  // }

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

  get() {
    return this.localDB.get(id).then(doc => {
      const { _rev, ...docWithoutRev } = doc;

      return docWithoutRev;
    }).catch(e => console.log(e));
  }

  update(id, attrs) {
    return this.localDB.get(id).then(doc => {
      this.localDB.put({
        _id: doc._id,
        _rev: doc._rev,
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
