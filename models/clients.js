const mongoose = require('mongoose');

const clientShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 50,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model('client', clientShema);
