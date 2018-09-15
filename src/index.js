// load environment variables
require('dotenv').config();
const {
  PORT: port,
  MONGO_URI: mongoURI
} = process.env;

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
// const cors = require('koa-cors');

const koaStatic = require('koa-static');
const path = require('path');
const fs = require('fs');

const db = require('./db');

const api = require('./api');
const jwtMiddleware = require('lib/middlewares/jwt');
// const cache = require('lib/cache');

db.connect();
const app = new Koa();

app.use((ctx, next) => {
  const allowedHosts = [
    'localhost:4000',
    '192.169.198.141:4000'  // aws hosting server info
  ];
  const origin = ctx.header['origin']; 
  ctx.response.set('Access-Control-Allow-Origin', origin);
/*
  allowedHosts.every(el => {
    if (!origin) return false;
    if (origin.indexOf(el) !== -1) {
      ctx.response.set('Access-Control-Allow-Origin', origin);
      return false;
    }
    return true;
  });
*/
  ctx.set('Access-Control-Allow-Credentials', true);
  ctx.response.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-timebase');
  return next();
});

app.use(compress());

app.use(jwtMiddleware);
app.use(bodyParser());

const router = new Router();
router.use('/api', api.routes());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  console.log(`blocktoken server is listening to port ${port}`);
});
