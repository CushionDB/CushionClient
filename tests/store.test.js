import Cushion from '../src/cushion';


describe('starting an unregistered new cushion DB instance', () => {
  const store = new Cushion().store;

  test('starts with default pouchDB if name not provided', () => {
    expect(store.localDB.name).toBe('cushionDB');
  });

  test('starts with an empty listeners list', () => {
    expect(store.listeners.length).toEqual(0);
  });

});

describe('Store functionality', () => {
  const store = new Cushion().store;
  const doc = { todo: 'Task 1', due: 'today', completed: false };
  let docID;

  test('Add document to cushionDB', () => {
    expect.assertions(1);
    return store.set(doc).then( id => {
      docID = id ;
      expect(id).toEqual(expect.anything()) 
    });
  });

  test('Retrieve document from cushionDB', () => {
    expect.assertions(1);
    return store.get(docID).then( doc => {
      expect(doc).toHaveProperty('_id', docID );
    });
  });

  test('Update document', () => {
    const attributes = { length: 3 };
    expect.assertions(1);
    return store.update(docID, attributes).then( id => {
      expect(id).toEqual(docID)
    });
  });

  test('Update document - check new field added', () => {
    expect.assertions(1);
    return store.get(docID).then ( doc => {
      expect(doc).toHaveProperty('length', 3);
    });
  });


});



