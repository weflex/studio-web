"use strict";

exports.client = require('@weflex/gian').getClient(process.env.GIAN_GATEWAY, {
  onAuthFail: (err) => {
    window.location.href = '/login?msg=' + (err && err.message);
  }
});
