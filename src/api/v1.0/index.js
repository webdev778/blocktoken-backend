const Router = require('koa-router');
const auth = require('./auth');
const users = require('./users');
const contract = require('./contract');
const identity = require('./identity');
const mfa = require('./mfa');

const api = new Router();

api.use('/auth', auth.routes());
api.use('/users', users.routes());
api.use('/contract', contract.routes());
api.use('/identity', identity.routes());
api.use('/mfa', mfa.routes());

module.exports = api;