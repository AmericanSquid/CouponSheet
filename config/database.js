const dbConfig = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: true,
    timezone: 'UTC',
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0
};

module.exports = dbConfig;
