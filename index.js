const Joi = require('joi');

const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(18).max(100),
});

console.log(schema);
console.log(schema.validate({ username: "testing", email: "test@email.com", age: 24 }));
console.log(schema.describe());
console.log(schema.describe().keys.username.rules);
console.log(schema.describe().keys.username.flags);