const mongoose = require('mongoose');
const validator = require('validator');

const userShema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: 'Email имеет некорректный формат',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  ROLE: {
    type: String,
    required: true,
    enum: ['ADMIN', 'USER', 'PURCHASER', 'CLIENT'],
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    minlength: 24,
    maxlength: 24,
  },
});

module.exports = mongoose.model('user', userShema);
