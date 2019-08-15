export const bindToChange = (db, callback) => {
 db.changes({
    live: true,
    since: 'now'
  }).on('change', callback);
}

export const createCouchUserDBName = (couchBaseURL, username) => {
  const hexUsername = Buffer.from(username, 'utf8').toString('hex');

  return `${couchBaseURL}/cushion_${hexUsername}`;
}

export const getSession = (remoteDB) => {
  if (!remoteDB) Promise.reject('User is not signed in');

  return remoteDB.getSession().then(res => {
    if (!res.userCtx.name) {
      return null;
    }

    return res;
  }).catch(err => {
    console.log(err);
  });
}


// export default {
// 	bindToChange,
// 	startSyncingToRemoteDB
// }