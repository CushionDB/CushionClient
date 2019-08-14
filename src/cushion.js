import Store from './store';
import Account from './account';
import MetaDB from './metaDB';

import { registerServiceWorker } from './utils/swUtils';

class Cushion {
  constructor() {
  	if (!TESTING) swUtils.registerServiceWorker();

  	const metaDB = new MetaDB();

  	metaDB.ready.then(() => {
			this.store = new Store(metaDB);
	    this.account = new Account(metaDB, this.store.userSignedIn);
  	});
  }
};

export default Cushion;
