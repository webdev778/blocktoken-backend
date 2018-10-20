const Joi = require('joi');
const User = require('db/models/User');
const projection = ['id', 'email', 'auth_status', 'kyc_status'];

const otplib = require('otplib');

// otplib.authenticator.options = {
//   step: 60,
//   window: 1
// };

exports.getURI = async (ctx) => {
  const { user } = ctx.request;
  const { _id } = user;

  console.log('[Get OTP Secret key]');
  try {
    const user = await User.findOne({_id}, projection);
    const { email } = user;

    const secret = otplib.authenticator.generateSecret();
    const token = otplib.authenticator.generate(secret);
    console.log(`OTP:${token}`);
    const uri = otplib.authenticator.keyuri(email, 'blocktoken', secret);

    ctx.body = {
      uri,
      secret
    };

  }catch(e){
    ctx.throw(e, 500);
  }
}

exports.verifyOTP = async (ctx) => {
  const { user } = ctx.request;
  const { _id } = user;
  const { body } = ctx.request;

  const schema = Joi.object({
    otp: Joi.string(),
    secret: Joi.string(),
  });

  const result = Joi.validate(body, schema);
  // schema error
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { otp, secret } = ctx.request.body;

  console.log('[Verify OTP]');
  console.log(ctx.request.body);

  try{
    // check KYC_STATUS
    // if(user.auth_status != 2) {
    //   ctx.status = 403;
    //   return;
    // }

    const validated = otplib.authenticator.check(otp, secret);

    if (!validated) {
      // wrong otp
      ctx.status = 403;
      console.log('wrong otp');
      return;
    }

    /*
    // update auth_status
    const user = await User.findOne({_id});
    user.auth_status = 3;    
    const updated = await user.save();
    */

    ctx.body = {
      verified : true
    }

  } catch (e) {
    ctx.throw(e, 500);
  }
}

