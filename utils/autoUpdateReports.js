const cron = require('node-cron');
const fs = require('fs');
const Article = require('../models/article');
const Scrapper = require('./scrapper');

async function positionsUpdate() {
  try {
    const articles = await Article.find({});
    const date = new Date().toLocaleString();
    const scrapper = new Scrapper();
    await scrapper.init();
    /* eslint-disable no-await-in-loop */
    /* eslint-disable-next-line */
    for (const article of articles) {
      const {
        numbers,
        keywords,
      } = article;
      const newKeywordsPositions = await scrapper.searchPositions(numbers, keywords);
      const newPositions = {
        date,
        keywords: newKeywordsPositions,
      };
      await Article.findByIdAndUpdate(
        article._id,
        {
          $push: {
            positions: {
              $each: [newPositions],
              $position: 0,
            },
          },
        },
        { new: true },
      );
    }
    await scrapper.close();
  } catch (err) {
    fs.writeFileSync(`./logs/err/${new Date().toISOString()}—positions`, err.toString());
  }
}

async function ratingUpdate() {
  try {
    const articles = await Article.find({ });
    const scrapper = new Scrapper();
    await scrapper.init();
    /* eslint-disable no-await-in-loop */
    /* eslint-disable-next-line */
    for (const article of articles) {
      const { rating, reviewsCount } = await scrapper.searchArticleRating(article);
      await Article.findByIdAndUpdate(
        article._id,
        { rating, reviewsCount },
        {
          new: true,
          runValidators: true,
        },
      );
    }
    await scrapper.close();
  } catch (err) {
    fs.writeFileSync(`./logs/err/${new Date().toISOString()}—rating`, err.toString());
  }
}

module.exports = cron.schedule('0 0 8,14,19,23 * * *', positionsUpdate, {
  scheduled: true,
  timezone: 'Europe/Moscow',
});

module.exports = cron.schedule('0 0 4 * * *', ratingUpdate, {
  scheduled: true,
  timezone: 'Europe/Moscow',
});
