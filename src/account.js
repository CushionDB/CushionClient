import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth);

const TEMP_CONFIG = {
  remoteBaseURL: 'http://localhost:5984/',
}

class Account {
  constructor(store) {
    this.store = store;
    const cushionMeta = new PouchDB('cushionMeta');
    cushionMeta.get('cushionMeta')
      .then(res => {
        this.remoteDB = new PouchDB(res.cushionRemoteDBAddress);
        this.store.attachRemoteDB(this.remoteDB);
      }).catch(err => {
        this.remoteDB = null;
      })
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

  getUserName() {
    return this.remoteDB.__opts.auth.username;
  }

  remoteDbName(username){
    const hexUsername = Buffer.from(username, 'utf8').toString('hex');
    this.remoteDBAddress = `${TEMP_CONFIG.remoteBaseURL}cushion_${hexUsername}`;
  }

  getClassName(){
  return this.constructor.name;
  }

  getRemoteDB(username, password) {
    if(!this.remoteDBAddress) this.remoteDbName(username);
    this.remoteDB = new PouchDB(this.remoteDBAddress, {skip_setup: true, auth: {username, password}});
    this.store.attachRemoteDB(this.remoteDB);
  }

  getUserName(){
    if (!this.remoteDB) return false;
    return this.remoteDB.__opts.auth.username;
  }

  getPassword(){
    if (!this.remoteDB) return false;
    return this.remoteDB.__opts.auth.password;
  }

  isSignedIn(){
    const cushionMeta = new PouchDB('cushionMeta');
    return cushionMeta.get('cushionMeta')
      .then(res => {
        // console.log(res);
        return true;
      }).catch(err => {
        console.log(err);
      });
  }

  signUp({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    return fetch('http://localhost:3001/signup', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    }).then(response => {

      // console.log('[RESPONSE] ', response);
      this.getRemoteDB(username, password)

      return response;
    }).catch(error => {
      console.log('[ERROR] ', error);
    });
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
    if (this.remoteDB) {
      return this.remoteDB.getSession().then(res => {
        // console.log("[GET SESSION RESPONSE]", res);
        return res;
      }).catch(err => {
        console.log("[GET SESSION ERROR]", err);
      });
    }
    // TODO: If user is not signed in
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

}

export default Account;
