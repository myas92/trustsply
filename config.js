// config.js
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({
	path: path.resolve(__dirname, '.env')
});

const configDB = {
    db: { 
      host: process.env.DB_HOST || '',
      user: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
	  connectionLimit: 1,
	  debug: false,
	  supportBigNumbers: true,
	  bigNumberStrings: true,
    },
    listPerPage: process.env.LIST_PER_PAGE || 10,
  };

module.exports = {
    configDB,
	NODE_ENV: process.env.NODE_ENV || 'Development',
	HOST: process.env.HOST || '127.0.0.1',
	PORT: process.env.PORT || 3000,

	REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
	REDIS_DB: process.env.REDIS_DB || '1',
	EMAIL: process.env.EMAIL || '',
	EMMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
	MAIL_SERVER: process.env.MAIL_SERVER || '',
	MAIL_PORT: process.env.MAIL_PORT || '',
	MY_DOMAIN: process.env.MY_DOMAIN || '',
	JWT: process.env.JWT || '',
	DOMAIN: process.env.DOMAIN || '',
	REDIS_HOST_PUB_SUB: process.env.REDIS_HOST_PUB_SUB || '',
	REDIS_DB_PUB_SUB: process.env.REDIS_DB_PUB_SUB || '',
	PHONE_SYSADMIN: process.env.PHONE_SYSADMIN
};
