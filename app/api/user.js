'use strict';

const Base = require('./base');

module.exports = {
  login: async (username, password) => {
    Base.request('/api/users/login');
  }
};
