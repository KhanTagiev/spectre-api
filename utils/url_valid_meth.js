const validator = require('validator');

module.exports = (value) => {
  const result = validator.isURL(value, { require_protocol: true });
  if (result) {
    return value;
  }
  throw new Error('Некорректный URL адрес');
};
