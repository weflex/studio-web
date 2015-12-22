'use strict';

const Agent = require('superagent-promise')(require('superagent'), Promise);
const Prefix = require('superagent-prefix');
// const BASE_URL = 'https://weflex-api-dev.herokuapp.com';
const BASE_URL = 'http://api.theweflex.com';
const APP_URL = location.protocol + '//' + location.host +
  (process.env.NODE_ENV === 'github' ? '/admin' : '');

module.exports = {

  get user () {
    var obj = localStorage.getItem('weflex.user');
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      obj = {};
    }
    var ret = {};
    for (let key in obj) {
      Object.defineProperty(ret, key, {
        get: function () {
          return obj[key];
        },
        set: function (val) {
          obj[key] = val;
          localStorage.setItem('weflex.user', JSON.stringify(obj));
        }
      });
    }
    return ret;
  },

  set user (obj) {
    localStorage.setItem('weflex.user', JSON.stringify(obj));
  },

  request: async function (endpoint='/', method='get', data={}) {
    var req = Agent[method.toLowerCase()](endpoint);
    req.use(Prefix(BASE_URL));
    req.query({
      access_token: this.user.accessToken,
      lastest: Math.random(),
      'filter[order]': 'created DESC'
    });
    req.send(data);
    var res;
    try {
      res = await req.end();
    } catch (e) {
      if (e.response && (e.response.status === 401 || e.response.status === 403)) {
        location.href = APP_URL + '/login?reason=' +
          (e.message || 'internal_error').toLowerCase();
      } else {
        throw e;
      }
    }
    return res && res.body;
  }

};