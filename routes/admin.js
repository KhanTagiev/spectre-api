const Router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const {
  signUp,
  changeRole,
} = require('../controllers/users');

Router.post('/users/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(50),
    ROLE: Joi.string().valid('ADMIN', 'USER', 'CLIENT'),
    clientId: Joi.string().hex().length(24),
  }),
}), signUp);

Router.patch('/users/role', celebrate({
  body: Joi.object().keys({
    ROLE: Joi.string().required().valid('ADMIN', 'USER', 'CLIENT'),
    userId: Joi.string().required().hex().length(24),
  }),
}), changeRole);

module.exports = Router;
