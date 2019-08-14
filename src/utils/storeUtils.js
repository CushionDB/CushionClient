export const contiouslyReplicateToRemote = (local, context) => {
	bindToChange(local, oneOffPushToRemote, context);
}

export const bindToChange = (db, callback, context) => {
 db.changes({
    live: true,
    since: 'now'
  }).on('change', callback.bind(context));
}