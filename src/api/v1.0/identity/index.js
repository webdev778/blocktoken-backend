const Router = require('koa-router');
const identity = new Router();

const needAuth = require('lib/middlewares/needAuth');
const identityCtrl = require('./identity.ctrl');

identity.get('/', ctx => {
    ctx.body = 'identity routing setting ok';
    
})

identity.post('/idreg', identityCtrl.identSave)
identity.post('/bankreg', needAuth, identityCtrl.bankSave)
identity.get('/getid/:user_id', needAuth, identityCtrl.getIdent)
identity.get('/getbank/:user_id', needAuth, identityCtrl.getBank)

module.exports = identity;