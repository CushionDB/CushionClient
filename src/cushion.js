import Store from './store';
import Account from './account';
import DatabaseAuth from './databaseAuth';

import { registerServiceWorker } from './utils/swUtils';
import { getConfigObj } from './utils/configUtils';

const TESTING = process.env.NODE_ENV === 'testing';
const CONFIG = getConfigObj();

console.log(CONFIG);

class Cushion {
  constructor() {
  	if (!TESTING) registerServiceWorker();
    
  	const dbAuth = new DatabaseAuth(CONFIG.couchBaseURL);

  	this.ready = dbAuth.ready;

  	dbAuth.ready.then(() => {
			this.store = new Store(dbAuth);
	    this.account = new Account(dbAuth);
  	});
  }
};

export default Cushion;
