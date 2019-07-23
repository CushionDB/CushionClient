
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth);

const TEMP_CONFIG = {
	remoteBaseURL: 'http://localhost:5984/',
}

class Account {

  constructor(store) {
    this.CushionStore = store;
  }

	getUserDB(username, password) {
		const hexUsername = Buffer.from(username, 'utf8').toString('hex');
		const remoteDBAddress = `${TEMP_CONFIG.remoteBaseURL}cushion_${hexUsername}`;
		this.remoteDB = new PouchDB(remoteDBAddress, {skip_setup: true, auth: {username, password}});
    this.CushionStore.attachRemoteDB(this.remoteDB);
	}

  isSignedIn(){
  }

  signUp({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    return fetch('http://localhost:3001/signup', {
      method: 'POST',
      body: JSON.stringify({username, password}),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    }).then(response => {
      console.log('[RESPONSE] ', response);

      this.getUserDB(username, password);
      return response;
    }).catch(error => {
      console.log('[ERROR] ', error);
    });
  }

  signIn({ username, password }) {
		this.getUserDB(username, password);

    this.remoteDB.logIn(username, password).then(res => {
      console.log("[SIGN-IN RESPONSE] ", res);
    }).catch(err => {
      console.log("[SIGN-IN ERROR] ", err);
    });
  }

  signOut() {
    this.remoteDB.logOut();
    // Remove session info or cookie
  }

  getSession() {
    if (this.remoteDB) {
      return this.remoteDB.getSession().then(res => {
        console.log("[GET SESSION RESPONSE]", res);
      }).catch(err => {
        console.log("[GET SESSION ERROR]", err);
      });
    }

    // TODO: If user is not signed in
  }

  get({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    let url = 'http://localhost:8080/api/info'
    let options = {
      method: 'POST',
      data: {
        name: username,
        password: password
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
    };

    this.request(url, options);
  }

  update(accountInfo) {
    let url = 'http://localhost:8080/api/update'
    let options = {
      method: 'PUT',
      data: accountInfo,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
    };

    this.request(url, options);
  }

  destroy({ username, password }) {
    let url = 'http://localhost:8080/api/destroy'
    let options = {
      method: 'DELETE',
      data: {
        name: username,
        password: password
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
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
      console.log('[RESPONSE] ', response);
      return response;
      // return response.status ;
    }).catch(error => {
      console.log('[ERROR] ', error);
    });
  }

}

export default Account;
