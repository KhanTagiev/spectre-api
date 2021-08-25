const Router = require('express').Router();

const {
  searchAllUserArticles,
  getReports,
  getAllReports,
} = require('../controllers/reports');

Router.get('/', getAllReports);
Router.get('/:articleId', getReports);
Router.post('/', searchAllUserArticles);

module.exports = Router;
