const Router = require('koa-router');

const users = new Router();
const usersCtrl = require('./users.ctrl');
const needAuth = require('lib/middlewares/needAuth');

users.get('/', needAuth, usersCtrl.getUserList);
users.get('/info', needAuth, usersCtrl.getUser);
users.put('/save', needAuth, usersCtrl.setUser);
users.put('/cert', needAuth, usersCtrl.setPassword);
users.put('/review', needAuth, usersCtrl.setReview);
users.put('/approve/:user_id', needAuth, usersCtrl.setApprove);
users.post('/marketing', needAuth, usersCtrl.setMarketingServices);
users.get('/services', needAuth, usersCtrl.getMarketingServices);

module.exports = users;