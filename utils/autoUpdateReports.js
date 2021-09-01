const cron = require('node-cron');
const fetch = require('node-fetch');

const autoUpdate = cron.schedule('5,10,20,30,45 * * * * *',() => {
  fetch('http://localhost:3000')
    .then(res => res.text())
    .then(text => console.log(text))
}, {
  scheduled: true,
  timezone: "Europe/Moscow"
});

module.exports = { autoUpdate }
