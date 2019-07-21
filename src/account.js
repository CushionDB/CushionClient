class Account {
  constructor({ remoteBaseURL }) {
    this.remoteBaseURL = remoteBaseURL;
    this.usersDbUrl = remoteBaseURL + '_users';

  }

  isSignedIn(){
    return localStorage.getItem('signedIn') === 'true';
  }

  signUp(accountInfo) {
    if (!accountInfo.username || !accountInfo.password) {
      throw new Error('username and password are required.');
    }

    let url = `http://localhost:3001/signup`
    let options = {
      method: 'POST',
      data: accountInfo,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    };

    this.request(url, options);
  }

  signIn({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    // let url = `http://127.0.0.1:5984/_session`
    let url = `http://localhost:3001/signin`

    let options = {
      method: 'POST',
      // credentials: 'include',
      // mode: 'cors',
      data: {
        name: username,
        password: password
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Authorization: 'Basic '+btoa(`${username}:${password}`)
      },
    };

    this.request(url, options).then( response => {
      console.log(response);
    } )

    // if(this.isSignedIn()) console.log('signed in true');
    // Do something with session info or cookie
  }

  signOut() {

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
