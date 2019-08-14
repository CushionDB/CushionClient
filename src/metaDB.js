import PouchDB from 'pouchdb';

let remoteDB;
let localDB;

class MetaDB {
	constructor() {
		localDB = 'cushionDB';
		this.ready = this.assignRemoteAddress();
	}

	localDB() {
 		return localDB;
 	}

 	remoteDB() {
 		return remoteDB;
 	}
	
	getMetaDB() {
		const cushionMeta = new PouchDB('cushionMeta');
		return cushionMeta.get('cushionMeta');
	}

	getRemoteDBAddress() {
		return this.getMetaDB().then(dbDoc => {
			return dbDoc.cushionRemoteDBAddress;
		}).catch(_ => Promise.resolve(null));
	}

	assignRemoteAddress() {
 		return this.getRemoteDBAddress().then(res => {
 			remoteDB = res;
 			return Promise.resolve();
 		});
 	}
}

export default MetaDB;