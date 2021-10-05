const mongoose = require('mongoose');

const purchaseShema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  purchaseList: [{
    keyword: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
    },
    purchaseCountPlan: {
      type: Number,
      required: true,
      minlength: 0,
      maxlength: 5,
      default: 0,
    },
    purchaseCountFact: {
      type: Number,
      required: true,
      minlength: 0,
      maxlength: 5,
      default: 0,
    },
    keywordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'article',
      required: true,
    },
    ownerArticle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'article',
      required: true,
    },
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
});

module.exports = mongoose.model('purchase', purchaseShema);
