export const bindToChange = (db, callback, context) => {
 db.changes({
    live: true,
    since: 'now'
  }).on('change', callback.bind(context));
}


// export default {
// 	bindToChange,
// 	startSyncingToRemoteDB
// }