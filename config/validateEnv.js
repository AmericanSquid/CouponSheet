const envalid = require('envalid');
const { str, port, num } = envalid;

module.exports = () => {
  return envalid.cleanEnv(process.env, {
    // Database Configuration
    DB_HOST: str(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_NAME: str(),
    DB_PORT: port({ default: 3306 }),
    
    // Email Configuration
    MJ_APIKEY_PUBLIC: str(),
    MJ_APIKEY_PRIVATE: str(),
    EMAIL_FROM: str({ format: 'email' }),
    EMAIL_NAME: str(),
    
    // Application Settings
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    PORT: port({ default: 3001 }),
    SESSION_SECRET: str(),
    CRYPTO_SECRET: str(),
    
    // Rate Limiting
    RATE_LIMIT_WINDOW: num(),
    RATE_LIMIT_MAX_REQUESTS: num()
  });
};
