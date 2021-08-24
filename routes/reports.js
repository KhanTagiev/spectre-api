const Router = require('express').Router();

const {
  searchArray,
  getReports,
  getAllReports,
} = require('../controllers/reports');

Router.get('/', getAllReports);
Router.get('/:articleId', getReports);
Router.post('/', searchArray);

module.exports = Router;
