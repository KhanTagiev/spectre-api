const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnAuthErr = require('../errors/un-auth-err');
const NotFoundErr = require('../errors/not-found-err');

const { NODE_ENV, JWT_SECRET } = process.env;
const { SECRET_CODE } = require('../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : SECRET_CODE);
    const user = await User.findById(payload._id);
    if (user.ROLE !== 'ADMIN') {
      return next(new NotFoundErr('Нет доступа'));
    }
    req.user = payload;
    return next();
  } catch (err) { return next(new UnAuthErr('Необходимо авторизоваться')); }
};
