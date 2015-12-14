const request = require('superagent');
const baseURL = 'http://api.theweflex.com/api/users'

var _token;
function login (username, password) {
  return new Promise((resolve, reject) => {
    request.post(`${baseURL}/login`)
      .send({username, password})
      .end((error, res) => {
        if (error) {
          return reject(error);
        }
        try {
          let data = JSON.parse(res.text);
          _token = data;
          return resolve(data);
        } catch (error) {
          return reject(error);
        }
      });
  });
}

function token () {
  return _token ? _token : {};
}

module.exports = {
  login,
  token
};
