var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CrowdsaleContractSchema = new Schema({
  multisig_eth: {
    type: String,
    required: true,
  },
  tokens_for_team: {
    type: Number
  },
  min_presale: {
    type: Number,
    required: true
  },
  min_mainsale: {
    type: Number,
    required: true,
  },
  max_contrib_eth: {
    type: Number,
    required: true
  },
  max_cap: {
    type: Number,
    required: true,
  },
  min_cap: {
    type: Number,
    required: true,
  },
  token_price_wei: {
    type: Number,
    required: true,
  },
  campaign_duration_days: {
    type: Number,
    required: true,
  },
  first_period: {
    type: Number,
  },
  second_period: {
    type: Number,
  },
  third_period: {
    type: Number,
  },
  first_bonus: {
    type: Number,
  },
  second_bonus: {
    type: Number,
  },
  third_bonus: {
    type: Number,
  },
  presale_bonus: {
    type: Number,
  },
  vesting_duration: {
    type: Number,
  },
  vesting_cliff: {
    type: Number,
  },
  vesting_start: {
    type: Number,
  },
  contract_address: {
    type: String,
    required: true,
  },
  whitelist_contract_address: {
    type: String,
  },
  user_id: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  token_contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TokenContract'
  },
  is_vesting_enabled: {
    type: Boolean
  },
  is_whitelisting_enabled: {
    type: Boolean
  },
  whitelist_addresses: {
    type: [String]
  }
});

module.exports = mongoose.model('CrowdsaleContract', CrowdsaleContractSchema);