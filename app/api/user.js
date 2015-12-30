'use strict';

const Base = require('./base');
const socket = io('ws://' + Base.hostname);

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
  },
  pending: async (onloggedIn) => {
    const data = await Base.request('/api/users/login/pending');
    socket.emit('register', {
      pendingId: data.id
    });
    socket.on('logged', (token) => {
      token = JSON.parse(token);
      Base.user = {
        userId: token.userId,
        accessToken: token.id
      };
      if (typeof onloggedIn === 'function') {
        onloggedIn();
      }
    });
    return data.id;
  },
  get: async (userId) => {
    var res = await Base.request('/api/users/' + userId);
    return res;
  }
};
