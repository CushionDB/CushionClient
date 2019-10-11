import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
PouchDB.plugin(PouchAuth);

import * as urls from './utils/urls';
import * as fetchUtils from './utils/fetchUtils';
import * as swUtils from './utils/swUtils';

let dbAuth;

class Account {
  constructor(dataAuth) {
    dbAuth = dataAuth;
  }

  isSignedIn() {
    return dbAuth.isSignedIn();
  }

  signUp({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    let errMessage;

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
        return { status: 'success' };
      }

      switch (response.status) {
        case 401:
          errMessage = 'CouchDB admin or password incorrect';
          break;
        case 409:
          errMessage = 'Username is taken';
          break;
        default:
          errMessage = 'Something went wrong';
      }

      return Promise.reject(errMessage)
    })

    .catch(err => Promise.reject(err));
  }

  signIn({ username, password }) {
    if (!username || !password) {
      return Promise.reject('username and password are required.');
    }

    return dbAuth.signIn(username, password)

    .then(res => { 
      return { status: 'success' }
    })

    .catch(err => Promise.reject(err));
  }

  signOut(options) {
    return dbAuth.signOut(options)
    .then(res => {
      return { status: 'success' }
    })
    .catch(err => Promise.reject(err));
  }

  getUserDoc(username) {
    return this.isSignedIn()

    .then(res => {
      if (!res) return Promise.reject('User is not signed in');

      return dbAuth.remoteDB.getUserDoc(username)
    })

    .catch(err => Promise.reject(err));
  }

  changePassword(username, newPassword) {
    return fetch(
      urls.changePassword(), 
      fetchUtils.getFetchOpts({
        method: 'POST',
        data: {
          name: username,
          roles: [],
          type: 'user',
          password: newPassword
        }
      })
    )

    .then(res => res.json())
    .then(json => {
      if (json.ok) {
        dbAuth.changePassword(username, newPassword);
      }
    })

    .catch(err => Promise.reject(err));
  }

  destroy(username) {
    return this.isSignedIn()

    .then(res => {
      if (!res) return Promise.reject('User is not signed in');

      return dbAuth.destroyUser(username);
    })

    .then(res => {
      if (res.ok) {
        return { status: 'success' };
      }
    })

    .catch(err => Promise.reject(err));
  }

  // changeUsername({curUsername, password, newUsername}){
  //   let url = `${TEMP_CONFIG.remoteBaseURL}updateUser`;
  //   let options = {
  //     method: 'PUT',
  //     data: {
  //       name: curUsername,
  //       password: password,
  //       newName: newUsername
  //     },
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Accept": "application/json"
  //     },
  //   };
  //   request(url, options);
  // }

  subscribeToNotifications() {
    let subscription;

    return this.isSignedIn()

    .then(res => {
      if (!res) return Promise.reject('User is not signed in');

      return swUtils.subscribeDeviceToNotifications();
    })

    .then(sub => {
      subscription = sub;
      return dbAuth.getUsername();
    })

    .then(username => {
      return fetch(
        urls.subscribeDeviceToPush(), 
        fetchUtils.getFetchOpts({
          method: 'POST',
          data: {
            username,
            subscription,
            device: navigator.platform
          }
        })
      );
    })
    
    .then(_ => {
      dbAuth.subscribeToNotifications();
      return { status: 'success' }
    })

    .catch(err => Promise.reject(err));
  }
}

export default Account;
