var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var identSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true
    },
    birthday: {
      type: String,
      required: true,
    },
    id_issuing_country: {
      type: String,
      required: true
    },
    id_type: {
      type: String,
      required: true,
    },
    id_number: {
      type: String,
      required: true,
    },
    id_expires: {
      type: String,
      required: true,
    },
    id_front: {
      type: Object,
      required: true,
    },
    id_back: {
      type: Object,
      required: true,
    }
  });

  
  module.exports = mongoose.model('Ident', identSchema);