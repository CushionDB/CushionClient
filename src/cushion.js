import Store from './store';
import Account from './account';

class Cushion {
  constructor() {
    this.store = new Store();
    this.account = new Account(this.store);
  }
};

export default Cushion;

// const cushion = new Cushion();

// cushion.account.signUp({
//   username: 'Foo',
//   password: 'secret'
// }).then( response => {
//   console.log(cushion.account.getUserName())
// }).catch(err => {
//   console.log(err)
// });

// cushion.store.set({
//   todo: 'Task 1',
//   completed: false
// }).then( docId => {
//   console.log(docId)
// }).catch( err => {
//   console.log(err);
// });

// cushion.store.getAll()
//   .then( docs => {
//     docs.forEach( doc => console.log(doc) ) ;
// }).catch(err => {
//   console.log(err);
// });
