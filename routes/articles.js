const Router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const {
  getArticles,
  getAllArticles,
  addArticles,
  deleteArticles,
  addKeyword,
  deleteKeyword,
} = require('../controllers/articles');

Router.get('/', getAllArticles);
Router.get('/:clientId', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
  }).unknown(true),
}), getArticles);
Router.post('/:clientId', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(50),
    number: Joi.number().required().min(999999).max(99999999),
    keywords: Joi.array(),
  }),
}), addArticles);
Router.delete('/:clientId/:articleId', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
}), deleteArticles);

Router.put('/:clientId/:articleId/keys', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
}), addKeyword);

Router.delete('/:clientId/:articleId/keys', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
}), deleteKeyword);

module.exports = Router;
