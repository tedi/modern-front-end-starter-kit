'use strict';
class MyClass {
    constructor(greet) {
        this.name = greet.name;
        this.greeting = greet.greeting;
    }
    greetPerson() {
        return `${this.greeting} ${this.name}`;
    }
}
 
export {MyClass};