import Store from './store';
import Account from './account';
import MetaDB from './metaDB';

import { registerServiceWorker } from './utils/swUtils';

const TESTING = process.env.NODE_ENV === 'testing';

class Cushion {
  constructor() {
  	if (!TESTING) registerServiceWorker();

  	const metaDB = new MetaDB();

  	metaDB.ready.then(() => {
			this.store = new Store(metaDB);
	    this.account = new Account(metaDB, this.store.userSignedIn);
  	});
  }
};

export default Cushion;
