var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var marketingServicesSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    marketing_services: {
      type: String
    }
});

module.exports = mongoose.model('MarketingServices', marketingServicesSchema);