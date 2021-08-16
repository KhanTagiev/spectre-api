const { ERR_CODE_NOT_FOUND } = require('../utils/constants');

class NotFoundErr extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERR_CODE_NOT_FOUND;
  }
}

module.exports = NotFoundErr;
