var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bankSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
    },
    bankimg: {
      type: String,
      required: true,
    },
    institution_name: {
      type: String,
      required: true,
    },
    doc_type: {
      type: String,
      required: true,
    },
    issued_date: {
      type: String,
      required: true,
    }
});

module.exports = mongoose.model('Bank', bankSchema);