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
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
  }).required().unknown(false),
});

const refreshTokenValidator = celebrate({
  cookies: Joi.object({
    refreshToken: Joi.string().required(),
  }).required().unknown(true),
});

export default { loginValidator, registerValidator, refreshTokenValidator };
