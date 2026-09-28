import { celebrate, Joi } from 'celebrate';

const productValidator = celebrate({
  body: Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }).required().unknown(false),
});

const productUpdateValidator = celebrate({
  params: Joi.object({
    productId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    title: Joi.string().min(2).max(30),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }),
    category: Joi.string(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }).min(1).required().unknown(false),
});

const productIdValidator = celebrate({
  params: Joi.object({
    productId: Joi.string().hex().length(24).required(),
  }),
});

const orderValidator = celebrate({
  body: Joi.object({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().trim().required(),
    address: Joi.string().trim().required(),
    total: Joi.number().required(),
    items: Joi.array()
      .items(Joi.string().hex().length(24).required())
      .min(1)
      .required(),
  }).required().unknown(false),
});

export default {
  productIdValidator,
  productUpdateValidator,
  productValidator,
  orderValidator,
};
