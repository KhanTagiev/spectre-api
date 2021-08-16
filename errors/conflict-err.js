const { ERR_CODE_CONFLICT } = require('../utils/constants');

class ConflictErr extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERR_CODE_CONFLICT;
  }
}

module.exports = ConflictErr;
