var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenContractSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String
  },
  version: {
    type: String,
    required: true
  },
  initial_supply: {
    type: String,
    required: true,
  },
  decimal_points: {
    type: Number,
    required: true
  },
  contract_address: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  team_addresses: {
    type: [String]
  }
});

module.exports = mongoose.model('TokenContract', TokenContractSchema);