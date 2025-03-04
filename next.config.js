const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  reactStrictMode: true,
  env: {
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
    ARK_API_KEY: process.env.ARK_API_KEY,
  },
};
 
