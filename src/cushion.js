import Store from './store';
import Account from './account';
// import MetaDB from './metaDB';
import DatabaseAuth from './databaseAuth';

import { registerServiceWorker } from './utils/swUtils';
import { getConfigObj } from './utils/configUtils';

const TESTING = process.env.NODE_ENV === 'testing';
const CONFIG = getConfigObj();

class Cushion {
  constructor() {
  	if (!TESTING) registerServiceWorker(CONFIG.couchBaseURL);

  	const dbAuth = new DatabaseAuth(CONFIG.couchBaseURL);

  	dbAuth.ready.then(() => {
  		// const dbAuth = new DatabaseAuth(metaDB, envVars.couchBaseURL);

			this.store = new Store(dbAuth);
	    this.account = new Account(dbAuth);
  	});
  }
};

export default Cushion;
