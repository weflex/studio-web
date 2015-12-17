'use strict';

const Base = require('./base');

module.exports = {
  list: async () => {
    var res = await Base.request('/api/orders');
    return res;
  }
};
