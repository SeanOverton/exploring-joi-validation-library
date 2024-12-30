# Exploring the JOI source code

This is just some notes while looking through the JOI validation library javascript source code available here:
https://github.com/hapijs/joi

Install with `npm install` in this project. `npm i joi`

## Initial findings
- Objected Oriented design
- Whole project in Javascript, then export typescript types seperately
when consumers optionally want them. Nowadays most packages source code 
will be written in typescript and then let the ts compiler handle creating
the js bundle.

## Basics
Basic process I wanted to analyse was the most familiar use case for JOI
ie. 
1. declaring a JOI object with some keys and JOI types
```
const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(18).max(100),
});
```

2. then validating another object with this type
```
schema.validate({ username: "testing", email: "test@email.com", age: 24 })
```

## General summary of code structure
Declaring a JOI object has crazy inheritance which initialises a bunch of custom methods on an object
and a heirarchical initilisation of the child keys and JOI objects. When validate is then called on the
most parent object, it continues to call validate on each respective key and exits early by throwing an
error on the first invalid value.

## Deep dive on code
- Starting with the default export in `./lib/index.js` a function is called and executed.
- All the type exported objects such as string set their _root private variable reference to the default
exported root object from `index.js`
- Line 63-68 of `index.js` attaches all the `any.js` methods exported methods onto the _root object that
is being exported from `index.js`. 

The object creation initialises a bunch of internal state variables and methods.

This is how the objects get stored internally:
```
{
  type: 'object',
  keys: {
    username: { type: 'string', flags: [Object], rules: [Array] },
    email: { type: 'string', flags: [Object], rules: [Array] },
    age: { type: 'number', rules: [Array] }
  }
}
```

where the flags represent boolean validation logic such as 'required':
eg.
```
{ presence: 'required' }
```

and the rules represent more complex validations where optionally args can be provided.
```
[
  { name: 'alphanum' },
  { name: 'min', args: { limit: 3 } },
  { name: 'max', args: { limit: 30 } }
]
```

Looking at the `base.js` which all the validator types (such as string()) extend from in their
prototypal inheritance we can see the validate function eventually ends up in the `validator.js` module
and eventually checks all flags and rules.

For the case in our example where we need to validate all the children. eg. inside this object
```
{
    username: Joi.string().required(),
}
```
the object itself only becomes valid once all the children keys are valid. This functionality can be found
inside the `keys.js` validate function which loops through all the keys and calls validate on the value of
each one respectively.
`extend.js` is another file worth mentioning because it provides helper functionality for inheriting and extending
from one exported object to another. For example; base.js exports an actual class object but then `any.js` extends
base and `keys.js` extends any and `object.js` extends keys. Via this inheritance Object Oriented Principle the
developer is able to reuse functionality across many of the validator types but still have the flexivility to
override functioanlity if required.

## So why all the effort for this architecture?
- Inheritance make it easy to extend (shared functionality) the base class with validation methods
that all the different validation types all require
- Objects achieve all the benefits of SOLID principles, ie. particularly the OPEN/CLOSE principle

For the senior dev that has been coding with Object Oriented design principles for decades their is probably no surprises in this project,
however for the newer to the scene dev with majority experience in a functional style of programming this project structure may have
initially been quite confusing.
So why then this structure? The package follows OOP principles closely and so gains all the perks (and cons) this comes with.

### Pros include:
- Code reusability; the inheritance helps share the functionality between the various validator types without being limited by the
existing implementation
- Testing and debugging is isolated to specific modules

### Cons inculde:
- learning curve? arguable, it takes time to get use to this type of archictecture and way of thinking
- boilerplate
- complexity? arguable

Thanks for reading. This has been a really quick analysis understanding the open source JOI JS package available at: https://github.com/hapijs/joi

Install with `npm install joi`