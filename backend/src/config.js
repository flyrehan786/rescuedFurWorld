require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4300,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  db: {
    host: process.env.DB_HOST || 'mysql-3b923478-mediqkafka.h.aivencloud.com',
    port: Number(process.env.DB_PORT) || 27964,
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'rescued_fur_world',
    ssl: process.env.DB_SSL ? process.env.DB_SSL === 'true' : true
  }
};
