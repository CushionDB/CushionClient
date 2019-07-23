import Store from './store';
import Account from './account';

class Cushion {
	constructor() {
		this.store = new Store(this.localDB);
		this.account = new Account(this.store);
	}
};

export default Cushion;
