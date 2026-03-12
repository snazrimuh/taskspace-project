'use strict';

const { createApp } = require('../dist/serverless');

let cachedHandler = null;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    const { server } = await createApp();
    cachedHandler = server;
  }
  cachedHandler(req, res);
};
