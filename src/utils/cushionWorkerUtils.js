import PouchDB from 'pouchdb';

export const pouchSync = (fromDB, toDB) => {
  return new PouchDB(fromDB).replicate.to(toDB);
}

export const addEventToArr = (arr, id, evt) => {
  if (arr.some(e => e.id === id)) throw new Error('Event ID taken');

  return [ ...arr, { id, evt } ];
}

export const removeEventFromArr = (arr, id) => {
	const len = arr.length;
	const filteredArr = arr.filter(evt => evt.id !== id);

	if (len === filteredArr.length) throw new Error('Event ID not found');

	return filteredArr;
}

export const triggerEvents = (arr, id, evt) => {
  return new Promise((res, rej) => {
    const event = arr.find(e => e.id === id).evt;

    event(evt);

    res(true);
    rej('Event with this ID not found');
  });
}

export const triggerUpdateUsersDevices = () => {
	
}
