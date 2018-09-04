const Router = require('koa-router');

const users = new Router();
const usersCtrl = require('./users.ctrl');
const needAuth = require('lib/middlewares/needAuth');

users.get('/', needAuth, usersCtrl.getUserList);

module.exports = users;