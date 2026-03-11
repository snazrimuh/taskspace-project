'use strict';

let cachedHandler = null;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    const { createApp } = require('../dist/serverless');
    const { server } = await createApp();
    cachedHandler = server;
  }
  cachedHandler(req, res);
};
