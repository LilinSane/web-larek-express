import { celebrate, Joi } from 'celebrate';

const loginValidator = celebrate({
  body: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }).required().unknown(false),
});

const registerValidator = celebrate({
  body: Joi.object({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().lowercase().allow(''),
    password: Joi.string().min(6).required(),
  }).required().unknown(false),
});

export default { loginValidator, registerValidator };
