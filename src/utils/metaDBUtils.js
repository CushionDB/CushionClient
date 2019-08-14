import PouchDB from 'pouchdb';

export const getMetaDB = () => {
	const cushionMeta = new PouchDB('cushionMeta');
	return cushionMeta.get('cushionMeta');
}

export const getRemoteDBAddress = () => {
	return getMetaDB().then(dbDoc => {
		return dbDoc.cushionRemoteDBAddress;
	}).catch(_ => Promise.resolve(null));
}