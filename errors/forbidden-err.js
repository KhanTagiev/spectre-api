const { ERR_CODE_FORBIDDEN } = require('../utils/constants');

class ForbiddenErr extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERR_CODE_FORBIDDEN;
  }
}

module.exports = ForbiddenErr;
