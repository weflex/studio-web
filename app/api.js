"use strict";

const presets = {
  "prod": {
    "api": "https://studio.theweflex.com",
    "app": "https://studio.theweflex.com",
    "ws":  "ws://studio.theweflex.com"
  }
};
let currentGateway = presets.prod;

if (process.env.GIAN_GATEWAY && process.env.GIAN_GATEWAY in presets) {
  currentGateway = presets[process.env.GIAN_GATEWAY];
}

exports.client = require('@weflex/gian').getClient(currentGateway, {
  onAuthFail: (err) => {
    window.location.href = '/login?msg=' + (err && err.message);
  }
});
