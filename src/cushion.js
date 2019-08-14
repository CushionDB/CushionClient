import Store from './store';
import Account from './account';

import MetaDB from './metaDB';

class Cushion {
  constructor() {
  	const metaDB = new MetaDB();

  	metaDB.ready.then(() => {
			this.store = new Store(metaDB);
	    this.account = new Account(metaDB, this.store);
  	});
  }
};

export default Cushion;
