const puppeteer = require('puppeteer');
const fs = require('fs');

const { NODE_ENV } = process.env;

class Scrapper {
  constructor() {
    this._browser = {};
    this._page = {};
    this._pageNumber = 1;
    this._articleList = [];
    this._isProductCard = false;
    this._articlesCount = '—';
    this._repeatCount = 0;
  }

  async init() {
    this._browser = await puppeteer.launch({
      headless: NODE_ENV === 'production',
      args: ['--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--deterministic-fetch',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
      ],
    });
    this._page = await this._browser.newPage();
    await this._page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36');
  }

  async _updateArticlesList(keyword) {
    const pageURL = `https://www.wildberries.ru/catalog/0/search.aspx?search=${keyword}&page=${this._pageNumber}`;
    try {
      await this._page.goto(pageURL, { waitUntil: 'networkidle0' });
      await this._page.waitForTimeout(1000);
    } catch (error) {
      fs.writeFileSync(`./logs/err/${new Date().toISOString()}—positions`, error.toString());
      return 'Failed to open the page';
    }

    try {
      await this._page.waitForSelector('#catalog-content .product-card', { timeout: 10000 });
      if (this._articlesCount === '—') {
        await this._page.waitForSelector('.goods-count', { timeout: 10000 });
      }
      await this._page.content();
      this._isProductCard = true;
    } catch (error) {
      this._isProductCard = false;
    }

    if (!this._isProductCard) {
      try {
        await this._page.waitForSelector('#catalog-content .dtList', { timeout: 10000 });
        if (this._articlesCount === '—') {
          await this._page.waitForSelector('.goods-count', { timeout: 10000 });
        }
        await this._page.content();
      } catch (error) {
        return 'Product not found';
      }
    }

    const {
      articlesList,
      count,
    } = await this._page.evaluate((articlesCount) => {
      let articlesCard;
      articlesCard = Array.from(document.body.querySelector('#catalog-content')
        .querySelectorAll('.product-card'));
      if (articlesCard.length === 0) {
        articlesCard = Array.from(document.body.querySelector('#catalog-content')
          .querySelectorAll('.dtList'));
      }

      const articlesListData = articlesCard.map((element) => {
        if (element.dataset.popupNmId === undefined) {
          return Number(element.dataset.nmId);
        }
        return Number(element.dataset.popupNmId);
      });
      let countData = articlesCount;
      if (countData === '—') {
        countData = document.body.querySelector('.goods-count').children[0].textContent;
      }

      return {
        articlesList: articlesListData,
        count: countData,
      };
    }, this._articlesCount);
    this._articleList.push(...articlesList);
    if (typeof (count) === 'string') {
      if (this._articlesCount === '—') {
        this._articlesCount = count;
      }
    }

    return 'Success';
  }

  async _searchNumbersPosition(keyword, numbers) {
    const status = await this._updateArticlesList(keyword);
    const numbersPositions = numbers.map((number) => ({
      number,
      position: this._articleList.indexOf(number) + 1,
    }));
    if (status === 'Product not found') {
      return numbersPositions.map((position) => ({
        ...position,
        error: 'No item was found for this keyword',
      }));
    }
    if (status === 'Failed to open the page') {
      if (this._repeatCount < 3) {
        this._repeatCount += 1;
        const searchNextPage = await this._searchNumbersPosition(keyword, numbers);
        return searchNextPage;
      }
      return numbersPositions.map((position) => ({
        ...position,
        error: 'Search error',
      }));
    }
    if (this._pageNumber > 20) {
      return numbersPositions.map((position) => ({
        ...position,
        error: 'Page limit',
      }));
    }
    const isSearchOver = numbersPositions.map((e) => e.position)
      .indexOf(0) === -1;
    if (!isSearchOver) {
      this._pageNumber += 1;
      const searchNextPage = await this._searchNumbersPosition(keyword, numbers);
      return searchNextPage;
    }
    return numbersPositions;
  }

  async close() {
    await this._browser.close();
  }

  async searchPositions(numbers, keywords) {
    if (Object.keys(this._page).length === 0) {
      await this.init();
    }
    this._pageNumber = 1;
    const keywordsPositionsResults = [];
    /* eslint-disable-next-line */
    for (const key of keywords) {
      this._pageNumber = 1;
      this._articleList = [];
      this._articlesCount = '—';
      this._repeatCount += 0;
      /* eslint-disable no-await-in-loop */
      const numbersPositions = await this._searchNumbersPosition(key.keyword, numbers);
      const keywordPosition = {
        keyword: key.keyword,
        isInWork: key.isInWork,
        articlesCount: this._articlesCount,
        numbers: numbersPositions,
      };
      keywordsPositionsResults.push(keywordPosition);
    }
    return keywordsPositionsResults;
  }

  async searchArticleRating(article) {
    if (Object.keys(this._page).length === 0) {
      await this.init();
    }
    const {
      numbers,
      rating = '0',
      reviewsCount = '0',
    } = article;
    const articlePageUrl = `https://www.wildberries.ru/catalog/${numbers[0]}/detail.aspx?targetUrl=XS`;
    try {
      await this._page.goto(articlePageUrl, { waitUntil: 'networkidle0' });
      await this._page.waitForTimeout(1000);
      await this._page.mouse.wheel({ deltaY: 3500 });
      await this._page.waitForTimeout(1000);
      await this._page.waitForSelector('.user-scores__score', { timeout: 10000 });
      await this._page.waitForTimeout(3000);
      const {
        newRating,
        newReviewsCount,
      } = await this._page.evaluate(() => {
        const reviewsText = document.querySelector('.user-scores__text').textContent;
        const reviewsCountResult = parseInt(reviewsText.replace(/[^\d]/g, ''), 10);
        const ratingResult = document.querySelector('.user-scores__score').textContent;
        return {
          newRating: ratingResult,
          newReviewsCount: reviewsCountResult,
        };
      });
      return {
        rating: newRating,
        reviewsCount: newReviewsCount,
      };
    } catch (error) {
      return {
        rating,
        reviewsCount,
      };
    }
  }
}

module.exports = Scrapper;
