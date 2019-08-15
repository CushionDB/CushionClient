import PouchDB from 'pouchdb';
import { getFetchOpts } from './utils/fetchUtils';
import * as urls from './utils/urls';

let remoteDB;
let localDB;
let metaDB;

class MetaDB {
	constructor() {
		this.localDBName = 'cushionDB';
		this.remoteDBAddress;
		this.ready = this.assignRemoteAddress();
	}

	localDB() {
 		return this.localDBName;
 	}

 	remoteDB() {
 		return this.remoteDBAddress;
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
 			this.remoteDBAddress = res;
 			return Promise.resolve();
 		});
 	}

 	startMetaDB(remoteAddress, username) {
 		return fetch(urls.isSubscribedToPush(username), getFetchOpts({
 			method: 'GET'
 		})).then(res => {
			console.log(res); 			

	    const cushionDBDoc = {
	    	_id: 'cushionMeta',
	    	cushionLocalDBName: this.localDB,
	    	cushionRemoteDBAddress: remoteAddress
	  	};

	 		metaDB = new PouchDB('cushionMeta');
	 		return metaDB.put(cushionDBDoc);
 		})
 	}

 	destroyMetaDB() {
		return new PouchDB('cushionMeta').destroy();
 	}
}

export default MetaDB;