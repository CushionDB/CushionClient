import Cushion from '../src/cushion';
import PouchDB from 'pouchdb'; 

const account = new Cushion().account;
const user = { username: 'foo', password: 'secret' };

describe('Test sign in', () => {

  test('Sign in foo user with secret password', () => {
    expect.assertions(1);
    return account.signIn(user).then( res => 
      expect(res.name).toBe('foo')
    ) 
  });

});

describe('Get session information', () => {
  test('Get user foo session information' , () => {
    expect.assertions(1);
    return account.getSession().then( res => {
      expect(res.ok).toBe(true);
    } );
  });
});

describe('Change foo password', () => {
  test('Change user foo password from secret to secret2', () => {
    expect.assertions(1);
    return account.changePassword(user.username, 'secret2')
      .then( res => expect(res.ok).toBe(true) );
  });
});

