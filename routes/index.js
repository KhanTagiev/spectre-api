const Router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const authMiddleware = require('../middlewares/auth');
const userRouter = require('./users');
const clientRouter = require('./clients');
const scrapperRouter = require('./scrapper');
const {
  signUp,
  signIn,
  signOut,
} = require('../controllers/users');

Router.get('/', async (req, res) => {
  try {
    res.send('Hy World');
  } catch (e) {
    res.send(e);
  }
});

Router.use('/search/', authMiddleware, scrapperRouter);
Router.use('/users/', authMiddleware, userRouter);
Router.use('/clients/', authMiddleware, clientRouter);

Router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
}), signUp);

Router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), signIn);

Router.post('/signout', authMiddleware, signOut);

module.exports = Router;
