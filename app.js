require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const { MONGODB_URL, MONGODB_OPTIONS } = require('./utils/mongodb_settings');
const Router = require('./routes/index');
const corsMiddleware = require('./middlewares/cors');

const app = express();

const { PORT = 3002 } = process.env;

mongoose.connect(MONGODB_URL, MONGODB_OPTIONS);

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/', Router);

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.listen(PORT, () => {});
