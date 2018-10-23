require('dotenv').config();
const db = require('./db');
db.connect();

const log = require('lib/log');

// add admin account 
const User = require('./db/models/User');

(async () => {
  try{
    // check if exist 
    const result = await User.findOne({
      auth_status: 99
    });

    if(result) {
      log.info('already admin account existed.');
      return;
    }

    // create
    await User.createAdmin({
      email: 'admin@blocktoken.ai',
      password: 'blocktoken',
      fullname: 'Administrator',
      address: 'Sydney, Australia',
      company: 'Blocktoken',
      website: 'https://blocktoken.ai',
    });

    log.info('Successfully created administrator account.');
    log.info({
      email: 'admin@blocktoken.ai',
      password: 'blocktoken',
      fullname: 'Administrator',
      address: 'Sydney, Australia',
      company: 'Blocktoken',
      website: 'https://blocktoken.ai',
    });

    exit(0);

  }catch( err ){
    log.error('seed failed');
    log.error(err);
  }
})();

process.exit(0);