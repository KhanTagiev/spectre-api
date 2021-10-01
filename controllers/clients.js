const Client = require('../models/clients');
const Article = require('../models/article');
const User = require('../models/user');

const BadReqErr = require('../errors/bad-req-err');
const ForbiddenErr = require('../errors/forbidden-err');
const NotFoundErr = require('../errors/not-found-err');
const ConflictErr = require('../errors/conflict-err');

const getClients = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const user = await User.findById(owner);
    let findConfig = { owner };
    if (user.ROLE === 'CLIENT') {
      findConfig = { _id: user.clientId };
    }
    if (user.ROLE === 'ADMIN' || user.ROLE === 'PURCHASER') {
      findConfig = { };
    }
    const clients = await Client.find(findConfig).sort('-date');
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
      return next(new ConflictErr('Клиент с таким именем уже существует'));
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
    const user = await User.findById(owner);
    if (user.ROLE !== 'ADMIN') {
      if (String(client.owner) !== owner) { return next(new ForbiddenErr('Клиент добавлен не вами')); }
    }

    const clientDelete = await Client.findByIdAndDelete(_id);
    await Article.deleteMany({ ownerClient: clientDelete._id });
    return res.send(clientDelete);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Передан некорректный _id клиента')); }

    return next(err);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const _id = req.params.clientId;
    const { name } = req.body;
    const client = await Client.findById(_id);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }
    const user = await User.findById(owner);
    if (user.ROLE !== 'ADMIN') {
      if (String(client.owner) !== owner) { return next(new ForbiddenErr('Это не ваш клиент')); }
    }
    const upClient = await Client.findByIdAndUpdate(
      _id,
      { name },
      {
        new: true,
        runValidators: true,
      },
    );
    return res.send(upClient);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Переданы некорректные данные для обновления имени')); }

    return next(err);
  }
};

const updateOwnerClient = async (req, res, next) => {
  try {
    const _id = req.params.clientId;
    const { newOwner } = req.body;
    const client = await Client.findByIdAndUpdate(
      _id,
      { owner: newOwner },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!client) {
      return next(new NotFoundErr('Клиент с указанным _id не найден'));
    }
    await Article.updateMany({ ownerClient: _id }, { owner: newOwner });

    return res.send(client);
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new BadReqErr('Передан некорректный _id пользователя'));
    }

    return next(err);
  }
};

module.exports = {
  getClients,
  addClient,
  deleteClient,
  updateClient,
  updateOwnerClient,
};
