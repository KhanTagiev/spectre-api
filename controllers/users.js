const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const BadReqErr = require('../errors/bad-req-err');
const ConflictErr = require('../errors/conflict-err');
const NotFoundErr = require('../errors/not-found-err');
const UnAuthErr = require('../errors/un-auth-err');
const { SECRET_CODE } = require('../utils/constants');

const signUp = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 12);

    const user = new User({
      email, password: hashedPassword, name, ROLE: 'USER',
    });

    await user.save();
    return res.send({
      _id: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadReqErr('Переданы некорректные данные для создания пользователя'));
    }
    if (err.name === 'MongoError' && err.code === 11000) {
      return next(new ConflictErr('Пользователь с таким Email уже существует'));
    }
    return next(err);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new UnAuthErr('Передан неверный логин или пароль'));
    }

    const isPasswordConfirm = bcrypt.compareSync(password, user.password);

    if (!isPasswordConfirm) {
      return next(new UnAuthErr('Передан неверный логин или пароль'));
    }

    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : SECRET_CODE, { expiresIn: '7d' });

    res.cookie('jwt', token, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: NODE_ENV === 'production' ? 'none' : true,
      secure: NODE_ENV === 'production' ? true : false,
    });

    return res.send({ token });
  } catch (err) {
    return next(err);
  }
};

const signOut = async (req, res, next) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: NODE_ENV === 'production' ? 'none' : true,
      secure: NODE_ENV === 'production' ? true : false,
    });

    return res.send('Токен удален');
  } catch (err) {
    return next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);
    if (!user) {
      return next(new NotFoundErr('Пользователь не найден'));
    }

    return res.send(user);
  } catch (err) {
    return next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { email, name } = req.body;
    const user = await User.findByIdAndUpdate(_id, { email, name }, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return next(new NotFoundErr('Пользователь не найден'));
    }

    return res.send(user);
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return next(new ConflictErr('Данный Email уже занят другим пользователем'));
    }
    if (err.name === 'ValidationError') {
      return next(new BadReqErr('Переданы некорректные данные для обновления профиля пользователя'));
    }
    return next(err);
  }
};

module.exports = {
  signUp,
  signIn,
  signOut,
  getUserProfile,
  updateUserProfile,
};
