import Store from './store';
import Account from './account';

import * as metaDBUtils from './utils/metaDBUtils'; 

const localDB = 'cushionDB';
let remoteDB = null;

class Cushion {
  constructor() {
  	this.assignRemoteAddress()
  	.then(() => {
	    this.store = new Store();
	    this.account = new Account(this.store);
  	});
  }

 	localDB() {
 		return localDB;
 	}

 	remoteDB() {
 		return remoteDB;
 	}

 	assignRemoteAddress() {
 		return metaDBUtils.getRemoteDBAddress().then(res => {
 			remoteDB = res;
 			return Promise.resolve();
 		});
 	}
};

export default Cushion;
