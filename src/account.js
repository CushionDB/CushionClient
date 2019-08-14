import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
import * as envUtils from './utils/envUtils';
import * as urls from './utils/urls';
import * as fetchUtils from './utils/fetchUtils';
import * as dbUtils from './utils/dbUtils';

PouchDB.plugin(PouchAuth);

const envVars = envUtils.getEnvVars();

let metaDB;
let remoteDB;

const getPassword = (remoteDB) => {
  if (!remoteDB) return undefined;
  return remoteDB.__opts.auth.password;
}  

class Account {
  constructor(metaDB, onSignInCallback) {
    this.onSignInCallback = onSignInCallback;

    metaDB = metaDB;

    if (metaDB.remoteDB()) {
      remoteDB = new PouchDB(metaDB.remoteDB(), {
        skip_setup: true
      });
    }

    // const cushionMeta = new PouchDB('cushionMeta');
    // cushionMeta.get('cushionMeta')
    //   .then(res => {
    //     this.remoteDB = new PouchDB(res.cushionRemoteDBAddress);
    //     this.store.attachRemoteDB(this.remoteDB);
    //   }).catch(err => {
    //     this.remoteDB = null;
    //   })
  }

  getUserName() {
    if (!this.isSignedIn) return undefined;

    return remoteDB.__opts.auth.username;
  }

  // getClassName(){
  //   return this.constructor.name;
  // }

  isSignedIn() {
    dbUtils.getSession(remoteDB).then(res => {
      return !!res;
    })
  }

  signUp({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    return fetch(
      urls.signup(envVars.couchBaseURL),
      fetchUtils.getFetchOpts({
        method: 'POST',
        data: {
          username,
          password
        }
      })
    )

    .then(response => {
      if (response.ok) {
        return {
          status: 'success',
          userID: response.id
        }
      }

      switch (response.status) {
        case 401:
          throw new Error('CouchDB admin or password incorrect');
        case 409:
          throw new Error('Username is taken');
        default:
          throw new Error('Something went wrong');
      }
    }).catch(err => {
      console.log(err);
    });
  }

  getRemoteDB(username, password) {
    if(!this.remoteDBAddress) this.remoteDbName(username);
    this.remoteDB = new PouchDB(this.remoteDBAddress, {skip_setup: true, auth: {username, password}});
    this.store.attachRemoteDB(this.remoteDB);
  }


  signIn({ username, password }) {
    this.getRemoteDB(username, password);
    // console.log(username, password);
    // console.log(this.remoteDB.name);

    return this.remoteDB.logIn(username, password)
      .then(res => {
        const cushionMeta = new PouchDB('cushionMeta');
        const cushionDBDoc = {
          _id: 'cushionMeta',
          cushionLocalDBName: this.store.localDB.name,
          cushionRemoteDBAddress: this.remoteDB.name
        };

        // console.log(res);

        cushionMeta.put(cushionDBDoc)
          .then(res => {
            this.store.pullFromRemoteDB();
            this.store.pushToRemoteDB();
          });

        return res;
      }).catch(err => {
        console.log("[SIGN-IN ERROR] ", err);
      });
  }

  signOut() {
    if (!this.isSignedIn()) throw new Error('User is not signed in');

    this.remoteDB.logOut()
      .then(res => {
        if (!res.ok) throw new Error('Sign out failed.');

        this.store.detachRemoteDB();
        this.remoteDB = null;
        new PouchDB('cushionMeta').destroy()
          .then(res => {
          }).catch(err => {
            console.log(err);
          });
      });
  }

  getSession() {
    if (!remoteDB) throw new Error('User is not signed in');

    return remoteDB.getSession().then(res => {
      if (!res.userCtx.name) {
        return null;
      }

      return res;
    }).catch(err => {
      console.log(err);
    });
  }

  getUserDoc(username){
    return this.remoteDB.getUser(username)
      .then( res => {
        // console.log(res) ;
        return res;
      }).catch( err => console.log(err) );
  }

  changePassword(username, newPassword){
    this.remoteDB.changePassword(username, newPassword)
      .then(res => {
        console.log(res)
        this.getRemoteDB(username, newPassword);
        return res;
      }).catch(err => console.log(err));
  }

  destroy(username){
    this.remoteDB.deleteUser(username)
      .then( res => {
        this.remoteDB = null;
        console.log(res); })
      .catch( err => console.log(err) );
  }

  changeUsername({curUsername, password, newUsername}){
    let url = `${TEMP_CONFIG.remoteBaseURL}update`;
    let options = {
      method: 'PUT',
      data: {
        name: curUsername,
        password: password,
        newName: newUsername
      },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };
    request(url, options);
  }

  request(url, options) {
    return fetch(url, {
      method: options.method,
      body: JSON.stringify(options.data),
      credentials: options.credentials,
      headers: options.headers,
    }).then(response => {
      // console.log('[RESPONSE] ', response);
      return response;
      // return response.status ;
    }).catch(error => {
      console.log('[ERROR] ', error);
    });
  }

  subscribeToNotifications() {
    this.isSignedIn()

    .then(() =>
      this.getServiceWorker().then(sw => {
        sw.ready.then(reg => {
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(envVars.publicVapid),
          }).then(subscription => {

            fetch(
              urls.subscribeDeviceToPush(envVars.couchBaseURL), 
              fetchUtils.getFetchOpts({
                method: 'POST',
                data: {
                  username: this.getUserName(),
                  subscription,
                  device: navigator.platform
                }
              })
            );
          });
        })
      })
    )

    .catch(() => {
      throw new Error('User must be signed in to subscribe')
    });
  }
}

export default Account;
