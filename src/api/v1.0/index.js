const Router = require('koa-router');
const auth = require('./auth');
const users = require('./users');
const contract = require('./contract');


const api = new Router();

api.use('/auth', auth.routes());
api.use('/users', users.routes());
api.use('/contract', contract.routes());

module.exports = api;