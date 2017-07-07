"use strict";

exports.client = require('@weflex/gian').getClient(process.env.NODE_ENV || 'prod', {
  onAuthFail: (err) => {
    window.location.href = '/login?msg=' + (err && err.message);
  }
});
