const Router = require('express').Router();

const {
  searchArray,
  getReports,
} = require('../controllers/reports');

Router.get('/:articleId', getReports);
Router.post('/', searchArray);

module.exports = Router;
