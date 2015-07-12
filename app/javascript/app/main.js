import {MyClass} from './hello';
 
var greet = {
    greeting: 'Hello',
    name: "World"
};
 
var x = new MyClass(greet);
 
//Hello World
console.log(x.greetPerson());