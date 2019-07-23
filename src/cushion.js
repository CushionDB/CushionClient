import Store from './store';
import Account from './account';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth);

const TEMP_CONFIG = {
	remoteBaseURL: 'http://localhost:5984/',
}

class Cushion {
	constructor({ localDBName, user }) {
		// this.remoteDB = null;
		this.localDB = new PouchDB(localDBName);
		this.store = new Store(this.localDB);
		this.account = new Account(this.handleGetUsereDB.bind(this), this.handleConnectToUserDB.bind(this));

		if (user) {
			this.handleConnectRemoteDB(user.username);
		}
	}

	// Retrieving user DB
	handleGetUsereDB(username, password) {
		const hexUsername = Buffer.from(username, 'utf8').toString('hex');
		const remoteDBAddress = `${TEMP_CONFIG.remoteBaseURL}cushion_${hexUsername}`;
		return new PouchDB(remoteDBAddress, {skip_setup: true, auth: {username, password}});
	}

	// Connecting Store and Account to user DB
	handleConnectToUserDB(db) {
		this.account.addRemoteDB(db);
		this.store.connectRemoteDB(db);
	}
};

export default Cushion;
