import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
PouchDB.plugin(PouchAuth);

import MetaDB from './metaDB';
import { scheduleSyncPush, scheduleSyncPull } from './utils/swUtils';

class DatabaseAuth {
  constructor(couchBaseURL) {
    this.metaDB = new MetaDB();
    this.couchBaseURL = couchBaseURL;
    this.ready = this.metaDB.ready;

    this.metaDB.ready

    .then(() => {	
      this.localDB = new PouchDB(this.metaDB.localDBName());

      if (this.metaDB.remoteDBName()) {
        this.remoteDB = new PouchDB(this.metaDB.remoteDBName());
        scheduleSyncPull();
      }

      this.bindToLocalDBChange(() => {
        this.isSignedIn().then(res => {
          if (res) {
            scheduleSyncPush();
          }
        })
      });
    })

    .catch(err => Promise.reject(err));
  }

  bindToLocalDBChange(callback) {
    this.localDB.changes({
      live: true,
      since: 'now'
    }).on('change', callback);
  }

  isSignedIn() {
    if (!this.remoteDB) return Promise.resolve(false);

    return this.getSession(this.remoteDB)

    .then(res => !!res)
    .catch(err => Promise.reject(err));
  }

  getSession(remoteDB) {
    return this.remoteDB.getSession()

    .then(res => {
      if (!res.userCtx.name) return null;

      return res;
    })
  }

// Keep ? 
  getPassword(remoteDB) {
    if (!this.remoteDB) return undefined;

    return this.remoteDB.__opts.auth.password;
  }

  signIn(username, password) {
    const couchUserDBName = DatabaseAuth.createCouchUserDBName(this.couchBaseURL, username);
    const fakeRemoteDB = this.createRemoteCouchDBHandle(couchUserDBName, username, password);

    return fakeRemoteDB.logIn(username, password)

    .then(res => this.metaDB.start(couchUserDBName, username))
    .then(res => {
      this.remoteDB = this.createRemoteCouchDBHandle(couchUserDBName);
      scheduleSyncPull();
      scheduleSyncPush();
      return true;
    })

    .catch(err => {
      if (err.name === 'unauthorized' || err.name === 'forbidden') {
        return Promise.reject('Username or password incorrect');
      }

      return Promise.reject(err);
    });
  }

  signOut(options = {}) {
    if (!this.remoteDB) return Promise.reject('No remote database to sign out with');

    return this.remoteDB.logOut()

    .then(res => {
      if (!res.ok) return Promise.reject('Sign out failed');

      if (options.destroyLocal) {
        return this.destroyLocal()
        .then(() => {
          this.localDB = new PouchDB(this.metaDB.localDBName());
          this.remoteDB = null;
          return this.metaDB.destroy();
        });
      }

      this.remoteDB = null;
      return this.metaDB.destroy();
    })

    .catch(err => Promise.reject(err));
  }

  destroyLocal() {
    return this.localDB.destroy()
    .then(res => res)
    .catch(err => Promise.reject(err));
  }

  createRemoteCouchDBHandle(remoteName, username, password) {
    return new PouchDB(
      remoteName, 
      {
        skip_setup: true, 
        auth: {
          username, 
          password
        }
      }
    );
  }

  changePassword(username, newPassword) {
    return this.signOut()
    
    .then(_ => this.signIn(username, newPassword));
  }

  destroyUser(username) {
    return this.remoteDB.deleteUser(username)

    .then(res => {
      this.remoteDB = null;
      return this.localDB.destroy();
    })

    .then(res => {
      return this.metaDB.destroy();
    })

    .catch(err => Promise.reject(err));
  }

  getUsername() {
    if (!this.remoteDB) return undefined;

    return this.metaDB.getUsername();
  }

  subscribeToNotifications() {
    this.metaDB.subscribeToNotifications();
  }

  getUserDoc(username) {
    return this.remoteDB.getUser(username);
  }

  static createCouchUserDBName(couchBaseURL, username) {
    const hexUsername = Buffer.from(username, 'utf8').toString('hex');

    return `${couchBaseURL}/cushion_${hexUsername}`;
  }
}

export default DatabaseAuth;
