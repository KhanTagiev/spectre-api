const Router = require('express').Router();
const wbScrapper = require('../utils/wbScrapper');

Router.post('/', async (req, res) => {
  try {
    const { article, key } = req.body;
    const result = await wbScrapper.search({ article, key });
    res.send(result);
  } catch (e) {
    res.send(e);
  }
});

module.exports = Router;
