const Purchase = require('../models/purchase');
const User = require('../models/user');

const NotFoundErr = require('../errors/not-found-err');
const ConflictErr = require('../errors/conflict-err');
const BadReqErr = require('../errors/bad-req-err');
const Client = require('../models/clients');

const getLastPurchases = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const { ago = 2 } = req.headers;
    const user = await User.findById(owner);
    let findConfig = { owner };
    if (user.ROLE === 'CLIENT') {
      findConfig = { ownerClient: user.clientId };
    }
    if (user.ROLE === 'ADMIN' || user.ROLE === 'PURCHASER') {
      findConfig = { };
    }

    const selectedDay = new Date();
    selectedDay.setDate(selectedDay.getDate() - ago);
    selectedDay.setHours(0, 0, 0, 0);

    const purchases = (await Purchase.find(findConfig).sort({ date: 1 }))
      .filter((el) => el.date >= selectedDay);
    return res.send(purchases);
  } catch (err) { return next(err); }
};

const createNewPurchasesList = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date, ownerClient } = req.body;

    const user = await User.findById(userId);
    if (user.ROLE === 'CLIENT' || user.ROLE === 'PURCHASER') { return next(new NotFoundErr('Нет доступа')); }

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }

    const { owner } = client;

    const findPurchases = await Purchase.findOne({ date, ownerClient });
    if (findPurchases) { return next(new ConflictErr('Список выкупов для данного клиента и на данную дату уже создан')); }

    const Purchases = new Purchase({ date, owner, ownerClient });
    await Purchases.save();
    return res.send(Purchases);
  } catch (err) {
    if (err.name === 'ValidationError') { return next(new BadReqErr('Переданы некорректные данные для создания списка выкупов')); }
    return next(err);
  }
};

const addKeywordForPurchases = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const {
      date, keyword, keywordId, ownerClient, ownerArticle,
    } = req.body;
    const user = await User.findById(owner);
    if (user.ROLE === 'CLIENT' || user.ROLE === 'PURCHASER') { return next(new NotFoundErr('Нет доступа')); }

    const client = await Client.findById(ownerClient);
    if (!client) { return next(new NotFoundErr('Нет клиента с указанным _id')); }

    let findPurchase = await Purchase.findOne({ date, ownerClient });
    if (!findPurchase) {
      findPurchase = new Purchase({ date, owner, ownerClient });
      await findPurchase.save();
    }
    const isAddedKeyword = findPurchase.purchaseList
      .find((el) => String(el.keywordId) === String(keywordId));
    if (isAddedKeyword) { return next(new ConflictErr('Ключевое слово уже добавлено в список выкупов')); }

    const newPurchase = await Purchase.findByIdAndUpdate(findPurchase._id, {
      $addToSet: {
        purchaseList: { keyword, keywordId, ownerArticle },
      },
    },
    {
      new: true,
      runValidators: true,
      sort: { date: -1 },
    });
    return res.send(newPurchase);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Передан некорректный _id выкупа')); }
    return next(err);
  }
};

const changePurchasesPlanCount = async (req, res, next) => {
  try {
    const { purchaseId, keywordId, purchaseCountPlan } = req.body;
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) { return next(new NotFoundErr('Нет выкупа с указанным _id')); }
    const newPurchase = await Purchase.findOneAndUpdate(
      { _id: purchaseId, 'purchaseList.keywordId': keywordId },
      {
        $set: { 'purchaseList.$.purchaseCountPlan': purchaseCountPlan },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return res.send(newPurchase);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Передан некорректный _id выкупа')); }
    return next(err);
  }
};

const changePurchasesFactCount = async (req, res, next) => {
  try {
    const { purchaseId, keywordId, purchaseCountFact } = req.body;
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) { return next(new NotFoundErr('Нет выкупа с указанным _id')); }
    const newPurchase = await Purchase.findOneAndUpdate(
      { _id: purchaseId, 'purchaseList.keywordId': keywordId },
      {
        $set: { 'purchaseList.$.purchaseCountFact': purchaseCountFact },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return res.send(newPurchase);
  } catch (err) {
    if (err.name === 'CastError') { return next(new BadReqErr('Передан некорректный _id выкупа')); }
    return next(err);
  }
};

module.exports = {
  getLastPurchases,
  createNewPurchasesList,
  addKeywordForPurchases,
  changePurchasesPlanCount,
  changePurchasesFactCount,
};
