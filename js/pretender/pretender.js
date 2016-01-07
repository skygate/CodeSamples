class PretenderBuilder {
    constructor (constructors) {
        this._constructors = constructors;
    }

    get name () {
        return this._constructors[0].constructor.name;
    }

    getMethodNames () {
        const methods = this._constructors.reduce((acc, constructor) => {
            return acc.concat(this.getPrototypeMethodNames(constructor.prototype));
        }, []);

        return this._deduplicate(methods);
    }

    getPrototypeMethodNames (prototype) {
        return Object.getOwnPropertyNames(prototype)
            .map(name => [name, Object.getOwnPropertyDescriptor(prototype, name)])
            .filter(([name, descriptor]) => {
                return descriptor.value instanceof Function;
            })
            .map(([name]) => name)
            .concat(this.getParentMethodNames(prototype));
    }

    getParentMethodNames (prototype) {
        const parent = this.getParentPrototype(prototype);
        if (parent != null) {
            return this.getPrototypeMethodNames(parent);
        } else {
            return [];
        }
    }

    getParentPrototype (prototype) {
        return prototype.__proto__;
    }

    _deduplicate (arr) {
        const itemsSet = new Set(arr);
        const output = [];

        itemsSet.forEach(item => output.push(item));

        return output;
    }
}

class JasminePretenderBuilder extends PretenderBuilder {
    build () {
        return jasmine.createSpyObj(this.name, this.getMethodNames());
    }
}

const pretenderBuilderImplementations = new Map([['Jasmine', JasminePretenderBuilder]]);

export default function pretender (implementation, ...constructorFunctions) {
    const pretenderBuilderConstructor = pretenderBuilderImplementations.get(implementation);
    const pretenderBuilder = new pretenderBuilderConstructor(constructorFunctions);
    return pretenderBuilder.build();
}


