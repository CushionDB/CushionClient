import Cushion from '../src/cushion';
import PouchDB from 'pouchdb'; 

  const store = new Cushion().store;
  store.localDB = new PouchDB('testDB');

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

  test('Get All docs', () => {
    expect.assertions(1);
    return store.getAll().then( docs => {
      expect(docs.length).toEqual(1);
    });
  });

  test('Delete a document', () => {
    expect.assertions(1);
    return store.delete(docID).then(id => {
      expect(id).toEqual(docID)
    });
  });


});



