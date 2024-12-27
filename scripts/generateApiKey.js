const crypto = require('crypto');

const apiKey = crypto.randomBytes(32).toString('hex');
console.log('Your API Key:', apiKey);
