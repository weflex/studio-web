"use strict";

exports.client = require('@weflex/gian').getClient('prod', {
  onAuthFail: (err) => {
    window.location.href = '/login?msg=' + (err && err.message);
  }
});
