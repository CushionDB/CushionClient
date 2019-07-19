
class Store {
	constructor(localDBName, username, remoteBaseURL) {
		// if (typeof localDBName !== 'string' || localDBName.length === 0) {
		// 	throw new Error('Database name must be a valid non-empty string.');
		// }

		// this.listeners = [];

		// this.localDBName = localDBName;
		// // this.localDB = new PouchDB(localDBName);

		// if (remoteBaseURL && username) {
		// 	this.connectRemote(remoteBaseURL, username);
		// }

		// this.bindToLocalChange(this.notifyListeners);
	}

	connectRemote(remoteBaseURL, username) {
		this.remoteDBAddress = `${remoteBaseURL}/${username}`;
		// this.remoteDB = new PouchDB(this.remoteDBAddress);
		this.bindToLocalChange(this.replicateToServer);
	}

	disconnectRemote() {
		this.remoteDBAddress = null;
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

	replicateToServer() {
		// PouchDB.replicate(this.localDBName, this.remoteDBAddress);
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
