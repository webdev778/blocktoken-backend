const Router = require('koa-router');

const users = new Router();
const usersCtrl = require('./users.ctrl');
const needAuth = require('lib/middlewares/needAuth');

users.get('/', needAuth, usersCtrl.getUserList);
users.get('/info', needAuth, usersCtrl.getUser);
users.put('/save', needAuth, usersCtrl.setUser);
users.put('/cert', needAuth, usersCtrl.setPassword);

module.exports = users;