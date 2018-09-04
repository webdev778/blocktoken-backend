const Joi = require('joi');
const User = require('db/models/User');

const projection = ['id', 'displayName', 'email', 'fullname', 'address', 'company', 'website'];

exports.getUserList = async (ctx)=> {

  try {
    const users = await User.find({}, projection);
    
    ctx.body = {
      users
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}