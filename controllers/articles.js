const Article = require('../models/article');
const User = require('../models/user');
const Client = require('../models/clients');

const BadReqErr = require('../errors/bad-req-err');
const ForbiddenErr = require('../errors/forbidden-err');
const NotFoundErr = require('../errors/not-found-err');
const ConflictErr = require('../errors/conflict-err');
const Scrapper = require('../utils/scrapper');
const { UPDATE_POSITIONS_STREAMS } = require('../utils/constants');

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
    const user = await User.findById(owner);
    let findConfig = { owner };
    if (user.ROLE === 'CLIENT') {
      findConfig = { ownerClient: user.clientId };
    }
    if (user.ROLE === 'ADMIN') {
      findConfig = { };
    }
    const articles = await Article.find(findConfig).sort('-date');
    return res.send(articles);
  } catch (err) { return next(err); }
};

const addArticles = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const {
      name, brand, category, numbers, keywords,
    } = req.body;
    const date = new Date();

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }

    const article = new Article({
      name, brand, category, numbers, keywords, owner, ownerClient, date,
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

const updateArticles = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const _id = req.params.articleId;
    const { name, brand, category } = req.body;

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }
    const article = await Article.findByIdAndUpdate(
      _id,
      { name, brand, category },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!article) { return next(new NotFoundErr('Такого артикула не существует')); }

    return res.send(article);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Переданы некорректные данные для обновления имени')); }

    return next(err);
  }
};

const addNumbers = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const _id = req.params.articleId;
    const { numbers } = req.body;

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }
    const article = await Article.findByIdAndUpdate(
      _id,
      { $addToSet: { numbers } },
      { new: true },
    );

    if (!article) { return next(new NotFoundErr('Такого артикула не существует')); }

    return res.send(article);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Переданы некорректные данные для добавления поисковых ключей')); }

    return next(err);
  }
};

const deleteNumber = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const ownerClient = req.params.clientId;
    const _id = req.params.articleId;
    const { number } = req.body;

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }
    const article = await Article.findByIdAndUpdate(
      _id,
      { $pull: { numbers: number } },
      { new: true },
    );

    if (!article) { return next(new NotFoundErr('Такого артикула не существует')); }

    return res.send(article);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Переданы некорректные данные для добавления поисковых ключей')); }

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

const updatePosition = async (req, res, next) => {
  try {
    const date = new Date().toLocaleString();
    const articlesArray = await Article.find({});
    const arraySize = Math.ceil(articlesArray.length / UPDATE_POSITIONS_STREAMS);
    const newArticles = articlesArray.reduce((a, b) => {
      if (a[a.length - 1].length === arraySize) {
        a.push([]);
      }

      a[a.length - 1].push(b);
      return a;
    }, [[]]);
    // eslint-disable-next-line no-inner-declarations
    async function articlesUpdate(articles) {
      const scrapper = new Scrapper();
      await scrapper.init();
      /* eslint-disable no-await-in-loop */
      /* eslint-disable-next-line */
      for (const article of articles) {
        const {
          numbers,
          keywords,
        } = article;
        const newKeywordsPositions = await scrapper.searchPositions(numbers, keywords);
        const newPositions = {
          date,
          keywords: newKeywordsPositions,
        };
        await Article.findByIdAndUpdate(
          article._id,
          {
            $push: {
              positions: {
                $each: [newPositions],
                $position: 0,
              },
            },
          },
          { new: true },
        );
      }
      await scrapper.close();
    }
    newArticles.forEach((articles) => articlesUpdate(articles));
    return res.send('Success');
  } catch (err) {
    return next(err);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const articles = await Article.find({ });
    const scrapper = new Scrapper();
    await scrapper.init();
    /* eslint-disable no-await-in-loop */
    /* eslint-disable-next-line */
    for (const article of articles) {
      const { rating, reviewsCount } = await scrapper.searchArticleRating(article);
      await Article.findByIdAndUpdate(
        article._id,
        { rating, reviewsCount },
        {
          new: true,
          runValidators: true,
        },
      );
    }
    await scrapper.close();
    return res.send('Success');
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getArticles,
  getAllArticles,
  addArticles,
  deleteArticles,
  updateArticles,
  updateRating,
  addNumbers,
  deleteNumber,
  addKeyword,
  deleteKeyword,
  updatePosition,
};
