const Report = require('../models/report');
const Article = require('../models/article');

const wbScrapper = require('../utils/wbScrapper');

const searchAllUserArticles = async (req, res) => {
  try {
    const articles = await Article.find({ });
    const date = new Date().toLocaleString();
    const reports = [];
    /* eslint-disable no-await-in-loop */
    /* eslint-disable-next-line */
    for (const article of articles) {
      const searchResults = await wbScrapper.searchArticle(article);
      const newReports = [];
      /* eslint-disable-next-line */
      for (const result of searchResults) {
        const report = await new Report({ ...result, date });
        await report.save();
        newReports.push(report);
      }
      reports.push(...newReports);
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
