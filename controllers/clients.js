const Client = require('../models/clients');
const Article = require('../models/article');
const Report = require("../models/report");


const BadReqErr = require('../errors/bad-req-err');
const ForbiddenErr = require('../errors/forbidden-err');
const NotFoundErr = require('../errors/not-found-err');
const ConflictErr = require('../errors/conflict-err');

const getClients = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const clients = await Client.find({ owner }).sort('-date');

    return res.send(clients);
  } catch (err) { return next(err); }
};

const addClient = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const { name } = req.body;
    const date = new Date();
    const client = new Client({ name, owner, date });
    await client.save();
    return res.send(client);
  } catch (err) {
    if (err.name === 'ValidationError') { return next(new BadReqErr('Переданы некорректные данные для добавления фильма')); }

    if (err.name === 'MongoError' && err.code === 11000) {
      return next(new ConflictErr('Пользователь с таким Email уже существует'));
    }
    return next(err);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const _id = req.params.clientId;
    const client = await Client.findById(_id);
    if (!client) { return next(new NotFoundErr('Клиент с указанным _id не найден')); }
    if (String(client.owner) !== owner) { return next(new ForbiddenErr('Клиент добавлен не вами')); }

    const clientDelete = await Client.findByIdAndDelete(_id);
    await Article.deleteMany({ownerClient: clientDelete._id});
    await Report.deleteMany({ownerClient: clientDelete._id});
    return res.send(clientDelete);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Передан некорректный _id клиента')); }

    return next(err);
  }
};

module.exports = {
  getClients,
  addClient,
  deleteClient,
};
