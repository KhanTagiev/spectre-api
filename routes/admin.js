const Router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const {
  signUp,
  changeRole,
} = require('../controllers/users');
const { updateOwnerClient } = require('../controllers/clients');

Router.post('/users/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(50),
    ROLE: Joi.string().valid('ADMIN', 'USER', 'PURCHASER', 'CLIENT'),
    clientId: Joi.string().hex().length(24),
  }),
}), signUp);

Router.patch('/users/role', celebrate({
  body: Joi.object().keys({
    ROLE: Joi.string().required().valid('ADMIN', 'USER', 'PURCHASER', 'CLIENT'),
    userId: Joi.string().required().hex().length(24),
  }),
}), changeRole);

Router.patch('/clients/:clientId', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    newOwner: Joi.string().required().hex().length(24),
  }),
}), updateOwnerClient);

module.exports = Router;
