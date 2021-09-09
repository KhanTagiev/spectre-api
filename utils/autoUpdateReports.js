const cron = require('node-cron');
const Article = require('../models/article');
const Report = require('../models/report');
const wbScrapper = require('./wbScrapper');

async function reportsUpdate() {
  try {
    const articles = await Article.find({ });
    const date = new Date().toLocaleString();
    /* eslint-disable no-await-in-loop */
    /* eslint-disable-next-line */
    for (const article of articles) {
      const searchResults = await wbScrapper.searchArticle(article);
      /* eslint-disable-next-line */
      for (const result of searchResults) {
        const report = await new Report({ ...result, date });
        await report.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function ratingUpdate() {
  try {
    const articles = await Article.find({ });
    /* eslint-disable no-await-in-loop */
    /* eslint-disable-next-line */
    for (const article of articles) {
      const { rating, reviewsCount } = await wbScrapper.searchArticleRating(article);
      await Article.findByIdAndUpdate(
        article._id,
        { rating, reviewsCount },
        {
          new: true,
          runValidators: true,
        },
      );
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = cron.schedule('0 0 8,14,19,23 * * *', reportsUpdate, {
  scheduled: true,
  timezone: 'Europe/Moscow',
});

module.exports = cron.schedule('0 0 4 * * *', ratingUpdate, {
  scheduled: true,
  timezone: 'Europe/Moscow',
});
