import Store from './store';
import Account from './account';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth);

const TEMP_CONFIG = {
	remoteBaseURL: 'http://localhost:5894/',
}

class Cushion {
	constructor({ localDBName, user }) {
		this.remoteDB = null;
		this.localDB = new PouchDB(localDBName);
		this.store = new Store(this.localDB);
		this.account = new Account(this.handleConnectRemoteDB.bind(this));

		if (user) {
			this.handleConnectRemoteDB(user.username);
		}
	}

	handleConnectRemoteDB(username, password) {
		const hexUsername = Buffer.from(username, 'utf8').toString('hex');
		const remoteDBAddress = `${TEMP_CONFIG.remoteBaseURL}cushion_${hexUsername}`;

		this.remoteDB = new PouchDB(remoteDBAddress, {skip_setup: true});

		this.remoteDB.logIn(username, password).then(res => {
			this.account.addRemoteDB(this.remoteDB);
			this.store.connectRemoteDB(this.remoteDB);
		}).catch(err => console.log(err));
	}
};

export default Cushion;
