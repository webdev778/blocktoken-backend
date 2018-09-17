const {sendSignupVerification} = require('lib/sendMail');

const firstName = 'Akira';
const lastName = '';
const email = 'akira20170313@gmail.com';
const code = 'test'

sendSignupVerification(firstName, lastName, email, code);