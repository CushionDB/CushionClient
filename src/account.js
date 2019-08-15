import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
// import * as envUtils from './utils/envUtils';
import * as urls from './utils/urls';
import * as fetchUtils from './utils/fetchUtils';
import * as swUtils from './utils/swUtils';
import * as dbUtils from './utils/dbUtils';

PouchDB.plugin(PouchAuth);

// const envVars = envUtils.getEnvVars();

let metaDB;
let dbAuth;
let remoteDB;

const getPassword = (remoteDB) => {
  if (!remoteDB) return undefined;
  return remoteDB.__opts.auth.password;
}

const createRemoteCouchDBHandle = (remoteName, username, password) => {
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

class Account {
  constructor(dataAuth) {
    // this.onSignInCallback = onSignInCallback;


    dbAuth = dataAuth;

    // if (metaDB.remoteDB()) {
    //   remoteDB = new PouchDB(metaDB.remoteDB(), {
    //     skip_setup: true
    //   });
    // }

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
    this.isSignedIn().then(res => {
      if (!res) return undefined;

      return dbAuth.remoteDB.__opts.auth.username;
    });
  }

  // getClassName(){
  //   return this.constructor.name;
  // }

  isSignedIn() {
    return dbAuth.isSignedIn();
    // if (!remoteDB) return Promise.resolve(false);

    // return dbUtils.getSession(remoteDB).then(res => {
    //   return !!res;
    // });
  }

  signUp({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    return fetch(
      urls.signup(),
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
        return {status: 'success'}
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
      throw new Error(err);
    });
  }

  signIn({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    return dbAuth.signIn(username, password).then(res => {status: 'success'})

    .catch(err => {
      throw new Error(err);
    });

    // const couchUserDBName = dbUtils.createCouchUserDBName(envVars.couchBaseURL, username)
    // const fakeRemoteDB = createRemoteCouchDBHandle(couchUserDBName, username, password)

    // return fakeRemoteDB.logIn(username, password)
      
    //   .then(res => {

    //     return metaDB.startMetaDB(couchUserDBName)

    //     .then(res => {
    //       if (res.ok) {
    //         remoteDB = createRemoteCouchDBHandle(couchUserDBName, username, password);
    //         this.onSignInCallback();
    //         return {status: 'success'};
    //       }
    //     })
    //   })

    //   .catch(err => {
    //     if (err.name === 'unauthorized' || err.name === 'forbidden') {
    //       throw new Error('User name or password incorrect');
    //     }

    //     console.log(err);

    //     throw new Error(err);
    //   });
  }

  // getRemoteDB(username, password) {
  //   if(!this.remoteDBAddress) this.remoteDbName(username);
  //   this.remoteDB = new PouchDB(this.remoteDBAddress, {skip_setup: true, auth: {username, password}});
  //   this.store.attachRemoteDB(this.remoteDB);
  // }

  signOut() {
    dataAuth.signOut().then(res => {status: 'success'})

    .catch(err => {
      throw new Error(err);
    })
    // return this.isSignedIn()

    // .then(res => {
    //   if (!res) throw new Error('User is not signed in');

    //   return remoteDB.logOut()

    //     .then(res => {
    //       if (!res.ok) throw new Error('Sign out failed');

    //       remoteDB = null;
    //       return metaDB.destroyMetaDB()

    //         .then(_ => {
    //           return {status: 'success'};
    //         })
    //     })
    // })

    // .catch(err => {
    //   throw new Error(err);
    // })
  }

  // getSession() {
  //   if (!remoteDB) throw new Error('User is not signed in');

  //   return remoteDB.getSession().then(res => {
  //     if (!res.userCtx.name) {
  //       return null;
  //     }

  //     return res;
  //   }).catch(err => {
  //     throw new Error(err);
  //   });
  // }

  getUserDoc(username) {
    this.isSignedIn().then(res => {
      if (!res) return undefined;

      return dbAuth.remoteDB.getUser(username)

        .then(res => {
          return res;
        })

        .catch(err => {
          throw new Error(err);
        })
    });
  }

  changePassword(username, newPassword){
    this.isSignedIn().then(res => {
      if (!res) {
        throw new Error('Must be signed in to do that');
      }

      return dbAuth.remoteDB.changePassword(username, newPassword)

        .then(res => {
          if (res.ok) {
            return {status: 'success'};
          } else {
            throw new Error({err: 'Something went wrong', res});
          }
        })

        .catch(err => {
          throw new Error(err);
        })
    });
  }

  destroy(username) {
    this.isSignedIn().then(res => {
      if (!res) {
        throw new Error('Must be signed in to do that');
      }

      return dbAuth.destroyUser(username)

        .then(res => {
          if (res.ok) {
            return {status: 'success'};
          } else {
            throw new Error({err: 'Something went wrong', res});
          }
        })

        .catch(err => {
          throw new Error(err);
        });
    });
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

  subscribeToNotifications() {
    this.isSignedIn()

    .then(res => {
      if (!res) {
        throw new Error('Must be signed in to do that');
      }

      swUtils.subscribeDeviceToNotifications()

      .then(subscription => {
        return this.getUserName()

          .then(username => {
            fetch(
              urls.subscribeDeviceToPush(), 
              fetchUtils.getFetchOpts({
                method: 'POST',
                data: {
                  username,
                  subscription,
                  device: navigator.platform
                }
              })
            ).then(_ => ({status: 'success'}));
          });
      })

      .catch(err => {
        throw new Error(err);
      });
    });
  }
}

export default Account;
