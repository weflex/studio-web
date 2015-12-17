'use strict';

const Base = require('./base');

module.exports = {
  list: async () => {
    return await Base.request('/api/classes');
  },
  create: async (prod) => {
    return await Base.request('/api/classes', 'post', prod);
  },
  update: async (id, updates) => {
    return await Base.request('/api/classes/' + id, 'put', updates);
  }
};
