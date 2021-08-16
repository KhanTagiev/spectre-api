const { ERR_CODE_UN_AUTH } = require('../utils/constants');

class UnAuthErr extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERR_CODE_UN_AUTH;
  }
}

module.exports = UnAuthErr;
