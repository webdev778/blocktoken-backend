const Joi = require('joi');
const User = require('db/models/User');
const MarketingServices = require('db/models/MarketingServices');

const projection = ['id', 'email', 'fullname', 'address', 'company', 'website', 'auth_status', 'kyc_status'];
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

exports.setReview = async (ctx)=> {
  const { user } = ctx.request;
  const { _id } = user;

  try {
    const user = await User.findOne({_id});
    user.kyc_status = 1;

    await user.save();
    ctx.body = {
      _id:user._id
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.setApprove = async (ctx)=> {
  const {user_id} = ctx.params;

  try {
    const user = await User.findOne({_id:user_id});

    user.auth_status = 2;
    user.kyc_status = 2;

    await user.save();
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

exports.setMarketingServices = async (ctx)=> {
  const { user } = ctx.request;
  const { _id } = user;

  const { body } = ctx.request;

  const schema = Joi.object({
    marketing_services: Joi.string()
  });

  const result = Joi.validate(body, schema);
  // schema error
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }


  const { marketing_services } = body;

  try {
    const user = await User.findOne({_id});
    await MarketingServices.deleteOne({user_id:user._id});
    const m_services = new MarketingServices({user_id:user._id, marketing_services})
    await m_services.save();

    ctx.body = {
      user_id:user._id
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.getMarketingServices = async (ctx)=> {
  const { user } = ctx.request;
  const { _id } = user;

  try {
    const user = await User.findOne({_id});
    const m_services = await MarketingServices.findOne({user_id:user._id});

    if (m_services === null)
    {
      ctx.body = {
        marketing_services:[]
      }
    }
    else
    {
      ctx.body = {
        marketing_services:m_services.marketing_services
      }
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}