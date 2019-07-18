class Store {
	constructor({ localDBName, username, remoteBaseURL }) {
		if (typeof localDBName !== 'string' || localDBName.length === 0) {
			throw new Error('Database name must be a valid non-empty string.');
		}

		this.localDBName = localDBName;
		this.localDB = new PouchDB(localDBName);

		if (remoteBaseURL) {
			this.remoteDBAddress = `${remoteBaseURL}/${username}`;
			this.remoteDB = new PouchDB(this.remoteDBAddress);
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
