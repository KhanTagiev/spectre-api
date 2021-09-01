const puppeteer = require('puppeteer');

const { NODE_ENV } = process.env;

module.exports = class Scrapper {
  static browser;

  static page;

  static pageNumber = 1;

  static isProductCard = false;

  static articleList = [];

  static async init() {
    Scrapper.browser = await puppeteer.launch({
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
    Scrapper.page = await Scrapper.browser.newPage();
    await Scrapper.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36');
  }

  static async updateArticlesList(keyword) {
    const pageURL = `https://www.wildberries.ru/catalog/0/search.aspx?search=${keyword}&page=${Scrapper.pageNumber}`;
    try {
      await Scrapper.page.goto(pageURL);
      await Scrapper.page.waitForTimeout(1000);
    } catch (error) {
      return 'Failed to open the page';
    }

    try {
      await Scrapper.page.waitForSelector('#catalog-content .product-card', { timeout: 10000 });
      await Scrapper.page.content();
      Scrapper.isProductCard = true;
    } catch (error) {
      Scrapper.isProductCard = false;
    }

    if (!Scrapper.isProductCard) {
      try {
        await Scrapper.page.waitForSelector('#catalog-content .dtList', { timeout: 10000 });
        await Scrapper.page.content();
      } catch (error) {
        return 'Product not found';
      }
    }

    function returnArticlesList() {
      const articleCards = () => {
        let cards = document.body.querySelector('#catalog-content')
          .querySelectorAll('.product-card');
        if (cards.length === 0) {
          cards = document.body.querySelector('#catalog-content')
            .querySelectorAll('.dtList');
        }
        return cards;
      };

      return Array.from(articleCards())
        .map((element) => {
          if (element.dataset.popupNmId === undefined) {
            return Number(element.dataset.nmId);
          }
          return Number(element.dataset.popupNmId);
        });
    }

    const articlesList = await Scrapper.page.evaluate(returnArticlesList);
    Scrapper.articleList.push(...articlesList);
    return 'Success';
  }

  static async searchNumbersPosition(article) {
    const {
      name,
      numbers,
      keyword,
      owner,
      ownerClient,
      ownerArticle,
    } = article;
    const status = await this.updateArticlesList(keyword);
    const articlePositions = numbers.map((number) => ({
      name,
      pagePosition: Scrapper.articleList.indexOf(number) + 1,
      number,
      keyword,
      owner,
      ownerClient,
      ownerArticle,
    }));
    if (status === 'Product not found') {
      const articlePositionWithError = articlePositions.map((position) => ({ ...position, error: 'No item was found for this keyword' }));
      return articlePositionWithError;
    }
    if (status === 'Failed to open the page') {
      const articlePositionWithError = articlePositions.map((position) => ({ ...position, error: 'Search error' }));
      return articlePositionWithError;
    }
    if (Scrapper.pageNumber > 20) {
      const articlePositionWithError = articlePositions.map((position) => ({ ...position, error: 'Page limit' }));
      return articlePositionWithError;
    }
    const isSearchOver = articlePositions.map((e) => e.pagePosition)
      .indexOf(0) === -1;
    if (!isSearchOver) {
      Scrapper.pageNumber += 1;
      const addArticlePositions = await this.searchNumbersPosition(article);
      return addArticlePositions;
    }
    return articlePositions;
  }

  static async close() {
    await Scrapper.browser.close();
  }

  static async searchArticle(article) {
    const {
      name,
      numbers,
      keywords,
      owner,
      ownerClient,
      _id,
    } = article;
    Scrapper.pageNumber = 1;
    await this.init();
    const articleSearchResult = [];
    /* eslint-disable-next-line */
    for (const keyword of keywords) {
      Scrapper.pageNumber = 1;
      Scrapper.articleList = [];
      /* eslint-disable no-await-in-loop */
      const articlePositions = await this.searchNumbersPosition({
        name,
        numbers,
        keyword,
        owner,
        ownerClient,
        ownerArticle: _id,
      });
      articleSearchResult.push(...articlePositions);
    }
    await this.close();
    return articleSearchResult;
  }
};
