const Report = require('../models/report');

const wbScrapper = require('../utils/wbScrapper');

const searchArray = async (req, res) => {
  try {
    const owner = req.user._id;
    const {
      number, keywords, ownerClient, _id,
    } = req.body;
    const results = await wbScrapper.searchArray({
      number, keywords, ownerClient, _id,
    });
    const reports = [];
    /* eslint-disable-next-line */
    for (const result of results) {
      const {
        keyword, pageNumber, pagePosition, ownerArticle, error,
      } = result;
      const date = new Date();
      /* eslint-disable no-await-in-loop */
      const report = await new Report({
        number, keyword, pageNumber, pagePosition, error, owner, ownerClient, ownerArticle, date,
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
    const number = Number(req.params.articleId);
    const reports = await Report.find({ number });

    return res.send(reports);
  } catch (err) { return next(err); }
};

module.exports = {
  searchArray,
  getReports,
  getAllReports,
};
