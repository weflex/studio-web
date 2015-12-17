'use strict';

const Base = require('./base');

module.exports = {
  login: async (username, password) => {
    var token = await Base.request('/api/users/login', 'post', {
      username,
      password
    });
    Base.user = {
      userId: token.userId,
      accessToken: token.id
    };
  },
  logout: () => {
    Base.user = null;
  }
};
