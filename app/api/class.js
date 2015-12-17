'use strict';

const Base = require('./base');

module.exports = {
  list: async () => {
    var res = await Base.request('/api/classes');
    return res;
  }
};
