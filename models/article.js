const mongoose = require('mongoose');

const articleShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  number: {
    type: Number,
    required: true,
    minlength: 5,
    maxlength: 10,
  },
  keywords: [{
    type: String,
    default: [],
  }],
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
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model('article', articleShema);
