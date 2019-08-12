import Cushion from '../src/cushion';
import PouchDB from 'pouchdb'; 

const store = new Cushion().store;
store.localDB = new PouchDB('testDB');
store.deleteAll();

describe('starting an unregistered new cushion DB instance', () => {

  test('starts with default pouchDB if name not provided', () => {
    expect(store.localDB.name).toBe('testDB');
  });

  test('starts with an empty listeners list', () => {
    expect(store.listeners.length).toEqual(0);
  });

});

describe('Store functionality', () => {
  const doc = { todo: 'Task 1', due: 'today', completed: false };
  let docID;

  test('Get All docs - no document exist', () => {
    expect.assertions(1);
    return store.getAll().then( docs => {
      expect(docs.length).toEqual(0);
    });
  });

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

  test('Add second document to cushionDB', () => {
    const doc2 = { todo: 'Task 2', due: 'tomorrow', completed: false };
    expect.assertions(1);
    return store.set(doc2).then( id => {
      return store.get(id).then(doc => 
        expect(doc).toHaveProperty('todo', 'Task 2')
      )
    });
  });

  test('Find a document by attribute', () => {
    // creates a index document within the local database
    expect.assertions(1);
    return store.find('todo', 'Task 2').then( docs =>
      expect(docs[0]).toHaveProperty('todo', 'Task 2')
    )
  });

  test('Get All docs', () => {
    expect.assertions(1);
    return store.getAll().then( docs => {
      // 2 docs plus index document
      expect(docs.length).toEqual(3);
    });
  });

  test('Delete a document', () => {
    expect.assertions(1);
    return store.delete(docID).then(id => {
      expect(id).toEqual(docID)
    });
  });

  test('Destroy DB ', () => {
    expect.assertions(1) ;
    return store.destroy().then( res => {
      expect(res).toHaveProperty('ok', true);
    });
  });
});



