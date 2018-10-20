const Router = require('koa-router');

const mfa = new Router();
const mfaCtrl = require('./mfa.ctrl');
const needAuth = require('lib/middlewares/needAuth');

mfa.get('/', needAuth, mfaCtrl.getURI);
mfa.post('/', needAuth, mfaCtrl.verifyOTP);

module.exports = mfa;