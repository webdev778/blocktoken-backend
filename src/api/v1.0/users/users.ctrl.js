const Joi = require('joi');
const User = require('db/models/User');

const projection = ['id', 'displayName', 'email', 'fullname', 'address', 'company', 'website'];
const project_user = ['id', 'fullname', 'address', 'company', 'website'];
const project_password = ['id', 'password'];

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

exports.getUser = async (ctx)=> {
  const { user } = ctx.request;
  const { _id } = user;

  try {
    const user = await User.findOne({_id}, project_user);
    
    ctx.body = {
      user
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.setUser = async (ctx)=> {
  const { user } = ctx.request;
  const { _id } = user;
  const { body } = ctx.request;

  const schema = Joi.object({
    fullname: Joi.string(),
    address: Joi.string(),
    company: Joi.string(),
    website: Joi.string()
  });

  const result = Joi.validate(body, schema);
  // schema error
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { fullname, address, company, website } = body;

  try {
    const user = await User.findById({_id}, project_user);

    user.fullname = fullname;
    user.address = address;
    user.company = company;
    user.website = website;

    const updated = await user.save();
    ctx.body = {
      updated
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.setPassword = async (ctx)=> {
  const { user } = ctx.request;
  const { _id } = user;
  const { body } = ctx.request;

  const schema = Joi.object({
    curpassword: Joi.string(),
    newpassword: Joi.strict()
  });

  const result = Joi.validate(body, schema);
  // schema error
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { curpassword, newpassword } = body;

  try {
    const user = await User.findById({_id}, project_password);
    const validated = user.validatePassword(curpassword)
    if (!validated) {
      // wrong password
      ctx.status = 403;
      return;
    }

    user.savePassword(newpassword)

    const updated = await user.save();
    ctx.body = {
      _id: updated._id
    }
    
    const accessToken = await user.generateToken();

    // configure accesstoken to httpOnly cookie
    ctx.cookies.set('access_token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
  } catch (e) {
    ctx.throw(e, 500);
  }
}