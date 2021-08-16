const MONGODB_URL = 'mongodb://localhost:27017/wblc';
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

module.exports = {
  MONGODB_URL,
  MONGODB_OPTIONS,
};
