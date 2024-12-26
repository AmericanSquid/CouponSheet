const crypto = require('crypto');

const generateSecret = () => {
    return crypto.randomBytes(64).toString('hex');
};

console.log('Generated Session Secret:', generateSecret());
console.log('Generated Crypto Secret:', generateSecret());