const mongoose = require('mongoose');
const { Schema } = mongoose;

const SysToken = new Schema({
    _userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

SysToken.statics.findByToken = (token) => {
    return this.findOne({token}).exec();
}

module.exports = mongoose.model('SysToken', SysToken);