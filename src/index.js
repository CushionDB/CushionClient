import Cushion from './cushion';
// import './cushion';

window.a = 123;

let st = new Cushion();
if (st) console.log('defined');

class Person {
  constructor(name){
    this.name = name;
  }
  getName(){
    return this.name;
  }
}

let p = new Person('bla');
console.log(p.getName());
if (Cushion) console.log('cushion imported');
console.log(a);
