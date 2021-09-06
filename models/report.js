const mongoose = require('mongoose');

const reportShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  brand: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  category: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 150,
  },
  number: {
    type: Number,
    required: true,
    minlength: 5,
    maxlength: 10,
  },
  keyword: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  pageNumber: {
    type: Number,
    minlength: 1,
    maxlength: 150,
  },
  pagePosition: {
    type: Number,
    minlength: 1,
    maxlength: 100,
  },
  error: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  ownerClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client',
    required: true,
  },
  ownerArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'article',
    required: true,
  },
});

module.exports = mongoose.model('report', reportShema);
