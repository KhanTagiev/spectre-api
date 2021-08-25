const puppeteer = require('puppeteer');

module.exports = class Scrapper {
  static browser;

  static page;

  static pageNumber = 1;

  static isProductCard = false;

  static isDtList = false;

  static async init() {
    Scrapper.browser = await puppeteer.launch({ headless: false });
    Scrapper.page = await Scrapper.browser.newPage();
    await Scrapper.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36');
  }

  static async returnArticlePosition(query) {
    const pageURL = `https://www.wildberries.ru/catalog/0/search.aspx?search=${query.keyword}&page=${Scrapper.pageNumber}`;
    try {
      await Scrapper.page.goto(pageURL);
      await Scrapper.page.waitForTimeout(5000);
    } catch (error) {
      const articlePosition = 'Failed to open the page';
      return articlePosition;
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
        const articlePosition = 'Product not found';
        return articlePosition;
      }
    }

    function returnArticlesList() {
      const articleCards = () => {
        let cards = document.body.querySelector('#catalog-content').querySelectorAll('.product-card');
        if (cards.length === 0) {
          cards = document.body.querySelector('#catalog-content').querySelectorAll('.dtList');
        }
        return cards;
      };

      return Array.from(articleCards()).map((element) => {
        if (element.dataset.popupNmId === undefined) {
          return Number(element.dataset.nmId);
        }
        return Number(element.dataset.popupNmId);
      });
    }

    const articlesList = await Scrapper.page.evaluate(returnArticlesList);
    const articlePosition = articlesList.indexOf(query.number) + 1;

    return articlePosition;
  }

  static async searchArticlePosition(query) {
    const articlePosition = await this.returnArticlePosition(query);

    if (articlePosition === 0) {
      Scrapper.pageNumber += 1;
      const newArticlePosition = await this.searchArticlePosition(query);
      return newArticlePosition;
    }
    if (articlePosition === 'Product not found') {
      const result = { error: 'No item was found for this keyword' };
      return result;
    }
    if (articlePosition === 'Failed to open the page') {
      const result = { error: 'Search error' };
      return result;
    }
    const result = { pageNumber: Scrapper.pageNumber, pagePosition: articlePosition };
    return result;
  }

  static async close() {
    await Scrapper.browser.close();
  }

  static async search(query) {
    Scrapper.pageNumber = 1;
    await this.init();
    const articlePosition = await this.searchArticlePosition(query);
    await this.close();
    return articlePosition;
  }

  static async searchAllArticles(articles) {
    await this.init();
    const result = [];
    /* eslint-disable-next-line */
    for (const article of articles) {
      const {
        name, number, keywords, owner, ownerClient, _id,
      } = article;
      Scrapper.pageNumber = 1;
      const articleResult = [];
      /* eslint-disable-next-line */
      for (const keyword of keywords) {
        Scrapper.pageNumber = 1;

        const articlePosition = await this.searchArticlePosition({ number, keyword });
        const item = {
          name, number, keyword, ...articlePosition, owner, ownerClient, ownerArticle: _id,
        };
        articleResult.push(item);
      }
      result.push(...articleResult);
    }
    await this.close();
    return result;
  }
};
