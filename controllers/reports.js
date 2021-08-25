const Report = require('../models/report');
const Article = require('../models/article');

const wbScrapper = require('../utils/wbScrapper');

const searchAllUserArticles = async (req, res) => {
  try {
    const owner = req.user._id;
    const articles = await Article.find({ owner });
    const results = await wbScrapper.searchAllArticles(articles);
    const reports = [];
    const date = new Date().toLocaleString();
    /* eslint-disable-next-line */
    for (const result of results) {
      const {
        name, number, keyword, pageNumber, pagePosition, ownerClient, ownerArticle, error,
      } = result;
      /* eslint-disable no-await-in-loop */
      const report = await new Report({
        name,
        number,
        keyword,
        pageNumber,
        pagePosition,
        error,
        owner,
        ownerClient,
        ownerArticle,
        date,
      });
      /* eslint-disable no-await-in-loop */
      await report.save();
      reports.push(report);
    }

    res.send(reports);
  } catch (e) {
    res.send(e);
  }
};

const getReports = async (req, res, next) => {
  try {
    const number = Number(req.params.articleId);
    const reports = await Report.find({ number }).sort('-date');

    return res.send(reports);
  } catch (err) { return next(err); }
};

const getAllReports = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const reports = await Report.find({ owner }).sort('-date');

    return res.send(reports);
  } catch (err) { return next(err); }
};

module.exports = {
  searchAllUserArticles,
  getReports,
  getAllReports,
};
