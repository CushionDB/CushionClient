
class Account {
  constructor({ remoteBaseURL }) {
    this.remoteBaseURL = remoteBaseURL;
    this.usersDbUrl = remoteBaseURL + '_users';
  }

  signUp(accountInfo) {
    if (!accountInfo.username || !accountInfo.password) {
      throw new Error('username and password are required.');
    }

    let url = 'http://localhost:8080/api/signup'
    let options = {
      method: 'POST',
      data: {
        name: accountInfo.username,
        password: accountInfo.password
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
    };

    request(url, options);
  }

  signIn({ username, password }) {
    if (!username || !password) {
      throw new Error('username and password are required.');
    }

    let url = 'http://localhost:8080/api/signin'
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

    request(url, options);
    // Add session info to localStorage
  }

  signOut() {
    // Remove session info from localStorage
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

    request(url, options);
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

    request(url, options);
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
    fetch(url, {
      method: options.method,
      body: JSON.stringify(options.data),
      mode: 'cors',
      headers: options.headers,
    }).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  }
}

export default Account;
