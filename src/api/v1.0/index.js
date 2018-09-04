const Router = require('koa-router');
const auth = require('./auth');
const users = require('./users');


const api = new Router();

api.use('/auth', auth.routes());
api.use('/users', users.routes());

module.exports = api;