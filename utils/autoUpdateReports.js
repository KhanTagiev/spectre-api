const cron = require('node-cron');
const Article = require('../models/article');
const Report = require('../models/report');
const wbScrapper = require('./wbScrapper');

async function reportsUpdate() {
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
  } catch (err) {
    console.log(err);
  }
}

module.exports = cron.schedule('0 0,39 0,8,17 * * *', reportsUpdate, {
  scheduled: true,
  timezone: 'Europe/Moscow',
});
