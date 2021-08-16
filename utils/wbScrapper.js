const puppeteer = require('puppeteer');

module.exports = class Scrapper {
  static browser;

  static page;

  static pageNumber = 1;

  static async init() {
    Scrapper.browser = await puppeteer.launch({ headless: false });
    Scrapper.page = await Scrapper.browser.newPage();
    await Scrapper.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36');
  }

  static async returnArticlePosition(query) {
    const pageURL = `https://www.wildberries.ru/catalog/0/search.aspx?search=${query.key}&page=${Scrapper.pageNumber}`;
    try {
      await Scrapper.page.goto(pageURL);
      /* console.log(`Открываю страницу: ${pageURL}`); */
    } catch (error) {
      /* console.log(`Не удалось открыть страницу: ${pageURL} из-за ошибки: ${error}`); */
    }
    try {
      await Scrapper.page.waitForSelector('#catalog-content .dtList', { timeout: 10000 });
      await Scrapper.page.content();
    } catch (error) {
      const articlePosition = 'Product not found';
      return articlePosition;
    }

    function returnArticlesList() {
      const articleCards = document.body.querySelector('#catalog-content').querySelectorAll('.dtList');
      return Array.from(articleCards).map((element) => {
        if (element.dataset.popupNmId === undefined) {
          return Number(element.dataset.nmId);
        }
        return Number(element.dataset.popupNmId);
      });
    }

    const articlesList = await Scrapper.page.evaluate(returnArticlesList);
    const articlePosition = articlesList.indexOf(query.article) + 1;

    return articlePosition;
  }

  static async searchArticlePosition(query) {
    const articlePosition = await this.returnArticlePosition(query);

    if (articlePosition === 0) {
      Scrapper.pageNumber += 1;
      const newArticlePosition = await this.searchArticlePosition(query);
      return newArticlePosition;
    }
    return articlePosition;
  }

  static async close() {
    await Scrapper.browser.close();
  }

  static async search(query) {
    await this.init();
    const articlePosition = await this.searchArticlePosition(query);
    await this.close();
    if (articlePosition === 'Product not found') {
      const result = { error: `No item ${query.article} was found for this keyword ${query.key}.` };
      return result;
    }
    const result = { pageNumber: Scrapper.pageNumber, position: articlePosition };
    return result;
  }
};
