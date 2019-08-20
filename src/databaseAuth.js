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

    this.metaDB.ready.then(() => {	
      this.localDB = new PouchDB(this.metaDB.localDB());

      if (this.metaDB.remoteDBName()) {
        this.remoteDB = new PouchDB(this.metaDB.remoteDBName());

        this.bindToLocalDBChange(function() {
        	console.log('change happend');
          this.isSignedIn().then(res => {
            console.log(res);
            if (res) {
              console.log('hello from signed in')
              scheduleSyncPush();
            }
          })
        }.bind(this));
      }
    })
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

      .catch(err => {
        throw new Error(err);
      });
  }

  getSession(remoteDB) {
    if (!this.remoteDB) Promise.reject('User is not signed in');

    return this.remoteDB.getSession().then(res => {
      if (!res.userCtx.name) {
        return null;
      }

      return res;
    }).catch(err => {
      console.log(err);
    });
  }

  getPassword(remoteDB) {
    if (!this.remoteDB) return undefined;

    return this.remoteDB.__opts.auth.password;
  }

  signIn(username, password) {
    const couchUserDBName = DatabaseAuth.createCouchUserDBName(this.couchBaseURL, username)
    const fakeRemoteDB = this.createRemoteCouchDBHandle(couchUserDBName, username, password)

    return fakeRemoteDB.logIn(username, password)

      .then(res => {
        return this.metaDB.start(couchUserDBName, username)

          .then(res => {
            this.remoteDB = this.createRemoteCouchDBHandle(couchUserDBName);
            return true;
          })
      })

      .catch(err => {
        if (err.name === 'unauthorized' || err.name === 'forbidden') {
          throw new Error('Username or password incorrect');
        }

        throw new Error(err);
      });
  }

  signOut() {
    // return this.isSignedIn()

    //   .then(res => {
    //     if (!res) throw new Error('User is not signed in');

        return this.remoteDB.logOut()

          .then(res => {
            if (!res.ok) throw new Error('Sign out failed');

            this.remoteDB = null;
            return this.metaDB.destroy()

              .then(_ => {
                return true;
              })
          })
      // })

      // .catch(err => {
      //   throw new Error(err);
      // })
  }

  createRemoteCouchDBHandle(remoteName, username, password) {
    return new PouchDB(remoteName, {skip_setup: true, 
      auth: {
        username, 
        password
      }
    });
  }

  changePassword(username, newPassword){
    this.signOut()
      .then(r => this.signIn(username, newPassword))
  }

  destroyUser(username) {
    return this.remoteDB.deleteUser(username)

      .then(res => {
        this.remoteDB = null;
        return this.localDB.destroy()
      })

      .then(res => {
        return this.metaDB.destroy();
      })

      .catch( err => console.log(err) );

  }

  static createCouchUserDBName(couchBaseURL, username) {
    const hexUsername = Buffer.from(username, 'utf8').toString('hex');

    return `${couchBaseURL}/cushion_${hexUsername}`;
  }

}

export default DatabaseAuth;
