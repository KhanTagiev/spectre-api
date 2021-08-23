const Article = require('../models/article');
const Client = require('../models/clients');

const BadReqErr = require('../errors/bad-req-err');
const ForbiddenErr = require('../errors/forbidden-err');
const NotFoundErr = require('../errors/not-found-err');
const ConflictErr = require('../errors/conflict-err');

const getArticles = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }
    const articles = await Article.find({ ownerClient }).sort('-date');

    return res.send(articles);
  } catch (err) { return next(err); }
};

const getAllArticles = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const articles = await Article.find({ owner }).sort('-date');

    return res.send(articles);
  } catch (err) { return next(err); }
};

const addArticles = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const { name, number, keywords } = req.body;
    const date = new Date();

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }

    const article = new Article({
      name, number, keywords, owner, ownerClient, date,
    });
    await article.save();
    return res.send(article);
  } catch (err) {
    if (err.name === 'ValidationError') { return next(new BadReqErr('Переданы некорректные данные для добавления артикула')); }

    if (err.name === 'MongoError' && err.code === 11000) {
      return next(new ConflictErr('Пользователь с таким Email уже существует'));
    }
    return next(err);
  }
};

const deleteArticles = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const _id = req.params.articleId;
    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }

    const article = await Article.findById(_id);
    if (!article) { return next(new NotFoundErr('Такого артикула не существует')); }
    if (String(article.ownerClient) !== ownerClient) { return next(new ForbiddenErr('Артикул не принадлежит данному клиенту')); }

    const articleDelete = await Article.findByIdAndDelete(_id);
    return res.send(articleDelete);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Передан некорректный _id клиента')); }

    return next(err);
  }
};

const addKeyword = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const _id = req.params.articleId;
    const { keywords } = req.body;

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }
    const article = await Article.findByIdAndUpdate(
      _id,
      { $addToSet: { keywords } },
      { new: true },
    );

    if (!article) { return next(new NotFoundErr('Такого артикула не существует')); }

    return res.send(article);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Переданы некорректные данные для добавления поисковых ключей')); }

    return next(err);
  }
};

const deleteKeyword = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const _id = req.params.articleId;
    const { keyword } = req.body;

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }
    const article = await Article.findByIdAndUpdate(
      _id,
      { $pull: { keywords: keyword } },
      { new: true },
    );

    if (!article) { return next(new NotFoundErr('Такого артикула не существует')); }

    return res.send(article);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Переданы некорректные данные для добавления поисковых ключей')); }

    return next(err);
  }
};

module.exports = {
  getArticles,
  getAllArticles,
  addArticles,
  deleteArticles,
  addKeyword,
  deleteKeyword,
};
