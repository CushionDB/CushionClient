export const getDefaultMetaDBDoc = (localDBName, remoteDBAddress, username, subscribedToPush) => {
	return {
  	_id: 'cushionMeta',
  	localDBName,
  	remoteDBAddress,
    username,
  	subscribedToPush
	};
}