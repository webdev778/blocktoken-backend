const Joi = require('joi');
const User = require('db/models/User');
const SysToken = require('db/models/SysToken');
// const { optionsPerCurrency } = require('lib/variables');
const { getProfile } = require('lib/social');
const { sendSignupVerification } = require('lib/sendMail');
const crypto = require('crypto');
const log = require('lib/log');


exports.checkEmail = async (ctx) => {
  const { email } = ctx.params;
  if (!email) {
    ctx.status = 400;
    return;
  }

  try {
    const account = await User.findOne({email});
    ctx.body = {
      exists: !!account
    };
  } catch (e) {
    ctx.throw(e, 500);
  }
};

exports.checkDisplayName = async (ctx) => {
  const { displayName } = ctx.params;

  if (!displayName) {
    ctx.status = 400;
    return;
  }
  try {
    const account = await User.findByDisplayName(displayName);
    ctx.body = {
      exists: !!account
    };
  } catch (e) {
    ctx.throw(e, 500);
  }
};

exports.check = async (ctx) => {
  const { user } = ctx.request;
  
  if(!user) {
    ctx.status = 401;
    return;
  }

  try {
    const exists = await User.findById(user._id);
    if(!exists) {
      // invalid user
      ctx.cookies.set('access_token', null, {
        maxAge: 0,
        httpOnly: true
      });
      ctx.status = 401;
      return;
    }

    const { auth_status, kyc_status, fullname, _id } = user;
    ctx.body = {
      _id,
      fullname,
      auth_status,
      kyc_status
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

exports.localRegister = async (ctx) => {
  const { body } = ctx.request;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30),
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


  const { email, password, fullname, address, company, website } = body;
  try {
    // check email / displayName existancy
    const exists = await User.findOne({email});
    if (exists) {
      // conflict
      ctx.status = 409;
      return;
    }
    console.log("end");
    // creates user account
    const user = await User.localRegister({
      email, password, fullname, address, company, website  
    });
    
    ctx.body = {
      _id: user._id
      // metaInfo: user.metaInfo
    };
    const accessToken = await user.generateToken();

    // configure accesstoken to httpOnly cookie
    ctx.cookies.set('access_token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    // Create a verification token for this user
    const token = new SysToken({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
 
    // Save the verification token
    await token.save();

    // Send the email    
    await sendSignupVerification(fullname, fullname, email, token.token);
    ctx.status = 200;
    ctx.body = `A verification email has been sent to ${email} .`;
    
  } catch (e) {
    ctx.throw(e, 500);
  }
};

exports.localLogin = async (ctx) => {
  const { body } = ctx.request;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30)
  });

  const result = Joi.validate(body, schema);

  if (result.error) {
    ctx.status = 400;
    return;
  }

  const { email, password } = body;

  try {
    // find user
    const user = await User.findOne({email});
    if (!user) {
      // user does not exist
      ctx.status = 403;
      return;
    }
    const validated = user.validatePassword(password);
    if (!validated) {
      // wrong password
      ctx.status = 402;
      return;
    }

    const accessToken = await user.generateToken();

    ctx.cookies.set('access_token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    const { auth_status, kyc_status, fullname, _id } = user;
    
    ctx.body = {
      _id,
      fullname,
      auth_status,
      kyc_status
    };
  } catch (e) {
    ctx.throw(e, 500);
  }
};

exports.socialLogin = async (ctx) => {
  const schema = Joi.object().keys({
    accessToken: Joi.string().required()
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    return;
  }
  
  const { provider } = ctx.params;
  const { accessToken } = ctx.request.body;
  
  console.log(`<social Login> REQUESTED`);
  // get social info
  let profile = null;
  try {
    profile = await getProfile(provider, accessToken);
  } catch (e) {
    ctx.status = 403;
    return;
  }

  if (!profile) {
    ctx.status = 403;
    return;
  }

  const {
    id, name, email
  } = profile;
  console.log(`Social Info, Provider:${provider}`);

  // check account existancy
  let user = null;
  try {
    user = await User.findSocialId({provider, id});
  } catch (e) {
    ctx.throw(e, 500);
  }

  if (user) {
    // if account exists, set JWt and return userInfo
    // set user status
    try {
      const btmToken = await user.generateToken();
      ctx.cookies.set('access_token', btmToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
      });  
    } catch (e) {
      ctx.throw(e, 500);
    }
    const { _id, fullname, auth_status, kyc_status, email } = user;
    ctx.body = {
      auth_status,
      kyc_status,
      fullname,
      email,
      _id
    };
    return;
  }

  if (!user && profile.email) {
    let duplicated = null;
    try {
      duplicated = await User.findOne({email});
    } catch (e) {
      ctx.throw(e, 500);
    }

    // if there is a duplicated email, merges the user account
    if (duplicated) {
      duplicated.social[provider] = {
        id,
        accessToken
      };
      try {
        await duplicated.save();
      } catch (e) {
        ctx.throw(e, 500);
      }
      // set jwt and return account info
      try {
        // set user status
        const btmToken = await duplicated.generateToken();
        ctx.cookies.set('access_token', btmToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7
        });
      } catch (e) {
        ctx.throw(e, 500);
      }
    }
  }

  if (!user) {
    // ctx.status = 204;
    ctx.body = {
      socialProfile:{
        id, name, email
      }
    };
  }
};

exports.socialRegister = async (ctx) => {
  const { body } = ctx.request;
  const { provider } = ctx.params;
  // check schema
  const schema = Joi.object({
    fullname: Joi.string(),
    address: Joi.string(),
    company: Joi.string(),
    website: Joi.string(),
    provider: Joi.string().allow('facebook', 'google', 'linkedin').required(),
    accessToken: Joi.string().required()
  });

  const result = Joi.validate(body.schema);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const {
    fullname,
    address,
    company,
    website,
    accessToken
  } = body;
  // get social info
  let profile = null;
  try {
    profile = await getProfile(provider, accessToken);
  } catch (e) {
    ctx.status = 403;
    return;
  }
  if (!profile) {
    ctx.status = 403;
    return;
  }

  const {
    email,
    id: socialId
  } = profile;

  // check email (+1 time)
  if (profile.email) {
    // will check only email exists
    // service allows social accounts without email .. for now
    try {
      const exists = await User.findOne({email:profile.email});
      if (exists) {
        ctx.body = {
          key: 'email'
        };
        ctx.status = 409;
        return;
      }
    } catch (e) {
      ctx.throw(e, 500);
    }
  }

  // // check displayName existancy
  // try {
  //   const exists = await User.findByDisplayName(displayName);
  //   if (exists) {
  //     ctx.body = {
  //       key: 'displayName'
  //     };
  //     ctx.status = 409;
  //   }
  // } catch (e) {
  //   ctx.throw(e, 500);
  // }
  
  // create user account
  let user = null;
  try {
    user = await User.socialRegister({
      email,
      fullname,
      address,
      company,
      website,
      provider,
      accessToken,
      socialId,
    });
  } catch (e) {
    ctx.throw(e, 500);
  }

  ctx.body = {
    _id: user._id
  };

  try {
    const btmToken = await user.generateToken();
    ctx.cookies.set('access_token', btmToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
  } catch (e) {
    ctx.throw(e, 500);
  }
  // generate accessToken
  // set cookie
};

exports.check = (ctx) => {
  const { user } = ctx.request;
  if (!user) {
    ctx.status = 403;
    return;
  }

  ctx.body = {
    user
  };
};

exports.logout = (ctx) => {
  console.log('logout')
  ctx.cookies.set('access_token', null, {
    maxAge: 0,
    httpOnly: true
  });
  ctx.status = 204;
};

exports.verifyEmail = async (ctx) => {
  log.info('VERIFYEMAIL requested');
  // const { body } = ctx.request;
  // const schema = Joi.object({
  //   email: Joi.string().email().required(),
  // });

  // const result = Joi.validate(body, schema);
  const { token } = ctx.params;

  log.info(token);
  if (!token) {
    ctx.status = 400;
    return;
  }

  // const {
  //   email,
  // } = ctx.request;

  try{
    // Find a matching token
    const sysToken = await SysToken.findOne({ token }).exec();

    if(!sysToken) {
      ctx.status = 403;
      return;
    }

    // If we found a token, find a matching user
    const user = await User.findOne({ _id: sysToken._userId });

    if (!user) {
      ctx.status = 400;
      return;
    }

    if (user.auth_status) {
      ctx.status = 401;
      return;
    }

    // Verify and save the user
    user.auth_status = 1;
    await user.save();
    
    ctx.body = "The account has been verified. Please log in.";
  }catch(e){
    ctx.throw(e, 500);
  }
}

exports.resendEmail = async (ctx) => {
  const { body } = ctx.request;
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const result = Joi.validate(body, schema);

  if (result.error) {
    ctx.status = 400;
    return;
  }

  const {
    email,
  } = body;

  try{
    const user = await User.findOne({email});
    if(!user){
      ctx.status = 400;      
    }

    if(user.auth_status){
      ctx.status = 401;
      return;
    }

    const token = new SysToken({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

    await token.save();
    
    await sendSignupVerification(user.fullname, '', email, token.token);
    ctx.body = `A verification email has been sent to ${email}.`;
  }catch(e){
    ctx.throw(e, 500);
  }
}

