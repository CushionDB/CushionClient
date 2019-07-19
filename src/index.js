import Store from './store';

class Cushion {
	constructor({ localDBName, username, remoteBaseURL }) {
		this.store = new Store(localDBName, username, remoteBaseURL);
	}

};

console.log('index.js is loaded');


export default Cushion;
