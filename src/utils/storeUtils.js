export const bindToChange = (db, callback) => {
 db.changes({
    live: true,
    since: 'now'
  }).on('change', callback);
}

export const notifyListeners = (listeners) => {
  listeners.forEach(l => l());
}

// export default {
// 	bindToChange,
// 	startSyncingToRemoteDB
// }