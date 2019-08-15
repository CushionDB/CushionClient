import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
PouchDB.plugin(PouchAuth);

import { scheduleSyncPush, scheduleSyncPull } from './utils/swUtils';

class DatabaseAuth {
	constructor(meta) {
		this.metaDB = meta;
		this.localDB = newPouchDB(this.metaDB.localDB());

		if (this.metaDB.remoteDB()) {
			this.remoteDB = new PouchDB(this.metaDB.remoteDB());

			this.bindToLocalDBChange(() => {
				this.isSignedIn().then(res => {
					if (res) scheduleSyncPush();
				})
			});
		}
	}

	bindToLocalDBChange(callback) {
		this.localDB.changes({
		  live: true,
		  since: 'now'
		 }).on('change', callback);
	}

	isSingedIn() {
		if (!this.remoteDB) return Promise.resolve(false);

    return this.getSession(this.remoteDB)

    .then(res => !!res)

    .catch(err => {
    	throw new Error(err);
    });
	}

	getSession(remoteDB) {
	  if (!this.remoteDB) Promise.reject('User is not signed in');

	  return this.remoteDB.getSession().then(res => {
	    if (!res.userCtx.name) {
	      return null;
	    }

	    return res;
	  }).catch(err => {
	    console.log(err);
	  });
	}

	getPassword(remoteDB) {
  	if (!this.remoteDB) return undefined;

  	return this.remoteDB.__opts.auth.password;
	}


	static createCouchUserDBName(couchBaseURL, username) {
	  const hexUsername = Buffer.from(username, 'utf8').toString('hex');

	  return `${couchBaseURL}/cushion_${hexUsername}`;
	}

}

export default DatabaseAuth;