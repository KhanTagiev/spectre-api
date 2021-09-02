const Router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const {
  getArticles,
  getAllArticles,
  addArticles,
  deleteArticles,
  updateName,
  addNumbers,
  deleteNumber,
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
    numbers: Joi.array().items(Joi.number().required().min(9999).max(1000000000)),
    keywords: Joi.array().items(Joi.string().required().min(2).max(150)),
  }),
}), addArticles);
Router.delete('/:clientId/:articleId', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
}), deleteArticles);

Router.patch('/:clientId/:articleId/name', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(50),
  }),
}), updateName);

Router.put('/:clientId/:articleId/numbers', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    numbers: Joi.array().items(Joi.number().required().min(9999).max(1000000000)),
  }),
}), addNumbers);

Router.delete('/:clientId/:articleId/numbers', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    number: Joi.number().required().min(9999).max(1000000000),
  }),
}), deleteNumber);

Router.put('/:clientId/:articleId/keys', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    keywords: Joi.array().items(Joi.string().required().min(2).max(150)),
  }),
}), addKeyword);

Router.delete('/:clientId/:articleId/keys', celebrate({
  params: Joi.object().keys({
    clientId: Joi.string().hex().length(24),
    articleId: Joi.string().hex().length(24),
  }).unknown(true),
  body: Joi.object().keys({
    keyword: Joi.string().required().min(2).max(150),
  }),
}), deleteKeyword);

module.exports = Router;
