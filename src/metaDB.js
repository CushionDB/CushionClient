import PouchDB from 'pouchdb';
import { getFetchOpts } from './utils/fetchUtils';
import * as utils from '/utils/metaDBUtils';
import * as urls from './utils/urls';

let metaDB;

class MetaDB {
	constructor() {
		this.localDBName = 'cushionDB';
		this.remoteDBAddress;
		this.ready = this.assignRemoteAddress();
	}

	localDBName() {
 		return this.localDBName;
 	}

 	remoteDBName() {
 		return this.remoteDBAddress;
 	}

	getMetaDB() {
		const cushionMeta = new PouchDB('cushionMeta');
		return cushionMeta.get('cushionMeta');
	}

	assignRemoteAddress() {
		return this.getMetaDB()

		.then(dbDoc => {
      this.remoteDBAddress = dbDoc.remoteDBAddress; 
		})

		.catch(_ => {
			this.remoteDBAddress = null; 
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
