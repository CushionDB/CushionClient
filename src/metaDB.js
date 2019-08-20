import PouchDB from 'pouchdb';
import { getFetchOpts } from './utils/fetchUtils';
import * as utils from './utils/metaDBUtils';
import * as urls from './utils/urls';

let metaDB;

class MetaDB {
	constructor() {
		this.localName = 'cushionDB';
		this.remoteAddress;
		this.pushSubscribed;
		this.ready = this.assignMetaVars();
	}

	localDBName() {
 		return this.localName;
 	}

 	remoteDBName() {
 		return this.remoteAddress;
 	}

 	subscribedToPush() {
 		return this.pushSubscribed;
 	}

	getMetaDB() {
		const cushionMeta = new PouchDB('cushionMeta');
		return cushionMeta.get('cushionMeta');
	}

	assignMetaVars() {
		return this.getMetaDB()

		.then(dbDoc => {
      this.remoteAddress = dbDoc.remoteDBAddress; 
      this.pushSubscribed = dbDoc.subscribedToPush;
      return Promise.resolve();
		})

		.catch(_ => {
			this.remoteAddress = null; 
			this.pushSubscribed = null;
			return Promise.resolve();
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
