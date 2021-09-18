const mongoose = require('mongoose');

const articleShema = new mongoose.Schema({
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
  numbers: [{
    type: Number,
    required: true,
    minlength: 5,
    maxlength: 10,
  }],
  keywords: [{
    keyword: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
    },
    isInWork: {
      type: Boolean,
      required: true,
      default: false,
    },
  }],
  rating: {
    type: String,
    minlength: 1,
    maxlength: 50,
    default: '0',
  },
  reviewsCount: {
    type: String,
    minlength: 1,
    maxlength: 50,
    default: '0',
  },
  positions: [
    {
      date: {
        type: Date,
        required: true,
        default: new Date(),
      },
      keywords: [
        {
          keyword: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 150,
          },
          isInWork: {
            type: Boolean,
            required: true,
            default: false,
          },
          articlesCount: {
            type: String,
            minlength: 1,
            maxlength: 1000,
          },
          numbers: [
            {
              number: {
                type: Number,
                required: true,
                minlength: 5,
                maxlength: 10,
              },
              position: {
                type: Number,
                minlength: 1,
                maxlength: 100,
              },
              error: {
                type: String,
                minlength: 2,
                maxlength: 50,
              },
            }],
        }],
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
