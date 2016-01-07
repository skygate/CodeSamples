import pretender from './pretender';

class Foo {
    bar () {}
}

class Bar {
    baz () {}
}


const fooMock = pretender('Jasmine', Foo);
fooMock.bar();
console.log(fooMock.bar.calls.count()); // 1

const mixinMock = pretender('Jasmine', Foo, Bar);
console.log(mixinMock.bar, mixinMock.baz); //they both are Jasmine's spies!
