const Router = require('koa-router');
const contract = new Router();
const needAuth = require('lib/middlewares/needAuth');
const contractCtrl = require('./contract.ctrl');
contract.get('/', ctx => {
  ctx.body = 'contract routing setting ok';
  
})

contract.post('/token', needAuth, contractCtrl.tokenRegist)
contract.get('/token', needAuth, contractCtrl.getTokenList)
contract.patch('/token/:id', needAuth, contractCtrl.addTeamMember)
contract.get('/getTokenContractByAddress/:address', needAuth, contractCtrl.getTokenContractByAddress)
contract.post('/crowdsale', needAuth, contractCtrl.crowdsaleRegist)
contract.patch('/crowdsale/:id', needAuth, contractCtrl.addWhiteList)
contract.get('/crowdsale', needAuth, contractCtrl.getCrowdsaleList)
contract.get('/getCrowdsaleContractByAddress/:address', needAuth, contractCtrl.getCrowdsaleContractByAddress)


module.exports = contract;