import PouchDB from 'pouchdb';
import { getFetchOpts } from './utils/fetchUtils';
import * as utils from './utils/metaDBUtils';
import * as urls from './utils/urls';

let metaDB;

class MetaDB {
	constructor() {
		this.localDBName = 'cushionDB';
		this.remoteDBAddress;
		this.subscribedToPush;
		this.ready = this.assignMetaVars();
	}

	localDBName() {
 		return this.localDBName;
 	}

 	remoteDBName() {
 		return this.remoteDBAddress;
 	}

 	subscribedToPush() {
 		return this.subscribedToPush;
 	}

	getMetaDB() {
		const cushionMeta = new PouchDB('cushionMeta');
		return cushionMeta.get('cushionMeta');
	}

	assignMetaVars() {
		return this.getMetaDB()

		.then(dbDoc => {
      this.remoteDBAddress = dbDoc.remoteDBAddress; 
      this.subscribedToPush = dbDoc.subscribedToPush;
		})

		.catch(_ => {
			this.remoteDBAddress = null; 
			this.subscribedToPush = null;
		});
	}

 	start(remoteDBAddress, username) {
 		return fetch(
 			urls.isSubscribedToPush(username),
 			getFetchOpts({
 				method: 'GET'
  		})
		)

    .then(res => res.json())
    .then(json => {

    const cushionDBDoc = utils.getDefaultMetaDBDoc(
    	this.localDBName(),
    	remoteDBAddress,
    	username,
    	json.subscribed
  	)

	 		metaDB = new PouchDB('cushionMeta');

	 		return metaDB.put(cushionDBDoc);
 		})

		.catch(err => Promise.reject(err));
 	}

 	destroy() {
		return new PouchDB('cushionMeta').destroy();
 	}
}

export default MetaDB;
