class Account {
  constructor(handleConnectRemoteDB) {
    this.remoteDB = null;
    this.onConnectRemoteDB = handleConnectRemoteDB;
  }

  addRemoteDB(remoteDB) {
    this.remoteDB = remoteDB;
  }

  isSignedIn(){
    // return localStorage.getItem('signedIn') === 'true';
    let authorization = JSON.parse(localStorage.getItem('auth'));
    return (!!authorization);
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

      this.onConnectRemoteDB(username, password);
      return response;
    }).catch(error => {
      console.log('[ERROR] ', error);
    });
  }


  // signUp(username, password) {
  //   return this.remoteDB.signUp(username, password)

  //     .then(res => {
  //       console.log(res);
  //     })

  //     .catch(err => {
  //       console.log(err);
  //     })


    // if (!accountInfo.username || !accountInfo.password) {
    //   throw new Error('username and password are required.');
    // }

    // let url = `http://localhost:3001/signup`
    // let options = {
    //   method: 'POST',
    //   data: accountInfo,
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Accept": "application/json",
    //   },
    // };

    // this.request(url, options);
  // }

  signInAttempt({ username, password }) {
    this.onConnectRemoteDB(username, password);

    // if (!username || !password) {
    //   throw new Error('username and password are required.');
    // }

    // if(this.isSignedIn()) console.log('signed in true');
    // Do something with session info or cookie
  }

  signOut() {
    localStorage.removeItem('auth');
    // Remove session info or cookie
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
