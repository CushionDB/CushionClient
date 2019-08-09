import Cushion from '../src/cushion';

describe('starting an unregistered new cushion DB instance', () => {
	const store = new Cushion().store;
	
	test('starts with default pouchDB if name not provided', () => {
		expect(store.localDB.name).toBe('cushionDB');
	});

	test('starts with an empty listeners list', () => {
		expect(store.listeners.length).toEqual(0);
	});

})

