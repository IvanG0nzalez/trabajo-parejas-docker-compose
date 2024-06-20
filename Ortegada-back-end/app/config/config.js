require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD,
    database: process.env.DB_DEV_DATABASE,
    dialect: "mysql",
    host: process.env.DB_DEV_HOST,
    operatorAliases: false,
    port: process.env.DB_DEV_PORT,
  },
  staging: {
    username: process.env.DB_STAGING_USERNAME,
    password: process.env.DB_STAGING_PASSWORD,
    database: process.env.DB_STAGING_DATABASE,
    dialect: "mysql",
    host: process.env.DB_STAGING_HOST,
    port: process.env.DB_STAGING_PORT || 12176,
    ssl: true,
    sslMode: "REQUIRED",
    operatorAliases: false
  },
  production: {
    username: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_DATABASE,
    dialect: "mysql",
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT || 12176,
    ssl: true,
    sslMode: "REQUIRED",
    operatorAliases: false
  }
};