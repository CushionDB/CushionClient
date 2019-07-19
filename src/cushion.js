import Store from './store';
import Account from './account';

class Cushion {
	constructor({ localDBName, username, remoteBaseURL }) {
		this.store = new Store(localDBName, username, remoteBaseURL);
		this.account = new Account(remoteBaseURL);
	}
};

export default Cushion;
