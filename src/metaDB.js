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

	assignRemoteAddress() {
		return this.getMetaDB().then(dbDoc => {
      this.remoteDBAddress = dbDoc.remoteDBAddress; 
		}).catch(_ => Promise.resolve(null));
	}

 	startMetaDB(remoteAddress, username) {
 		return fetch(urls.isSubscribedToPush(username), getFetchOpts({
 			method: 'GET'
    })).then( res => res.json() )
    .then(json => {
			// console.log(json); 			

	    const cushionDBDoc = {
	    	_id: 'cushionMeta',
	    	localDBName: this.localDB(),
	    	remoteDBAddress: remoteAddress,
        username: username,
	    	// MAKE DYNAMIC
	    	subscribedToPush: json.subscribed 
	  	};

	 		metaDB = new PouchDB('cushionMeta');
	 		return metaDB.put(cushionDBDoc);
 		})
		.catch(err => console.log(err));
 	}

 	destroy() {
		return new PouchDB('cushionMeta').destroy();
 	}
}

export default MetaDB;
