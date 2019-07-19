import Store from './store';

class Cushion {
	constructor({ localDBName, username, remoteBaseURL }) {
		this.store = new Store(localDBName, username, remoteBaseURL);
	}
};

export default Cushion;
