const Router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const {
  getClients,
  addClient,
  deleteClient,
  updateClient,
} = require('../controllers/clients');

Router.get('/', getClients);
Router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(50),
  }),
}), addClient);
Router.delete('/:clientId', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
  }).unknown(true),
}), deleteClient);
Router.patch('/:clientId', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(50),
  }),
}), updateClient);

module.exports = Router;
