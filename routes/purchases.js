const Router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getLastPurchases,
  createNewPurchasesList,
  addKeywordForPurchases,
  changePurchasesPlanCount,
  changePurchasesFactCount,
} = require('../controllers/purchases');

Router.get('/', celebrate({
  headers: Joi.object().keys({
    ago: Joi.number().min(0).max(40),
  }).unknown(true),
}), getLastPurchases);

Router.post('/', celebrate({
  body: Joi.object().keys({
    date: Joi.date().required().min('1.1.2021').max('1.1.2030'),
    ownerClient: Joi.string().required().hex().length(24),
  }),
}), createNewPurchasesList);

Router.put('/', celebrate({
  body: Joi.object().keys({
    date: Joi.date().required().min('1.1.2021').max('1.1.2030'),
    keyword: Joi.string().required().min(2).max(150),
    keywordId: Joi.string().required().hex().length(24),
    ownerClient: Joi.string().required().hex().length(24),
    ownerArticle: Joi.string().required().hex().length(24),
  }),
}), addKeywordForPurchases);

Router.patch('/plan', celebrate({
  body: Joi.object().keys({
    purchaseCountPlan: Joi.number().required().min(0).max(100000),
    keywordId: Joi.string().required().hex().length(24),
    purchaseId: Joi.string().required().hex().length(24),
  }),
}), changePurchasesPlanCount);

Router.patch('/fact', celebrate({
  body: Joi.object().keys({
    purchaseCountFact: Joi.number().required().min(0).max(100000),
    keywordId: Joi.string().required().hex().length(24),
    purchaseId: Joi.string().required().hex().length(24),
  }),
}), changePurchasesFactCount);

module.exports = Router;
