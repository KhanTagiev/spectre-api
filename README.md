# Backend проекта Spectre

Это REST API на базе Node.js для [Frontend SPECTRE](https://github.com/KhanTagiev/spectre-frontend) — сервиса c личным кабинетом пользователя для отслеживания позиций SKU(идентификатор товарной позиции) в поисковой выдаче.
Зарегистрированному пользователю доступно: добавление/редактирование клиентов, SKU, артикулов SKU и ключевых слов для поискового запроса.

## Используемые технологии:

1. [Express](https://expressjs.com/) — фреймворк для Node.js.
2. [MongoDB](https://www.mongodb.com/) — NoSQL база данных.
3. [Mongoose](https://mongoosejs.com/) – ODM-библиотека для работы с MongoDB.
4. [Puppeteer](https://pptr.dev/) - библиотека Node, API для управления Chromium через [DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

## Директории

`/routes` — папка с файлами роутера

`/controllers` — папка с файлами контроллеров пользователя, клиентов, артикулов и отчетов

`/models` — папка с файлами описания схем пользователя, клиентов, артикулов и отчетов

`/errors` — папка с файлами классов ошибок

`/middlewares` — папка с файлами middleware-ов

`/utils` — папка с конфигурационными файлами и модулем парсинга позиций


## Запуск проекта

`npm run start` — запускает сервер

`npm run dev` — запускает сервер с hot-reload**

`npx eslint .` — запускает проверку на ошибки eslint-ом

`npx eslint . --fix` — запускает исправление ошибок eslint-ом
