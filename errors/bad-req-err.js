const { ERR_CODE_BAD_REQ } = require('../utils/constants');

class BadReqErr extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERR_CODE_BAD_REQ;
  }
}

module.exports = BadReqErr;
