const crypto = require('crypto');
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('Generated API Key:', apiKey);

const generateSecret = () => {
    return crypto.randomBytes(64).toString('hex'); // 64 bytes = 512 bits
};

const secret = generateSecret();
console.log('Generated JWT Secret:', secret);
