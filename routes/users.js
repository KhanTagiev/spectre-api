const Router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const {
  getUserProfile,
  updateUserProfile,
} = require('../controllers/users');

Router.get('/me', getUserProfile);
Router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(50),
  }),
}), updateUserProfile);

module.exports = Router;
