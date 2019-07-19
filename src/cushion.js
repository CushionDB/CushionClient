import Store from './store';

class Cushion {
	constructor({ localDBName, username, remoteBaseURL }) {
		this.store = new Store(localDBName, username, remoteBaseURL);
	}

};







let ch = new Cushion({localDBName:'test',username:'foo',remoteBaseURL:'http'});
if(ch) console.log('ch is alive');
if (Store) console.log('Store foo imported');

// console.log('cushion is loaded');


export default Cushion;
