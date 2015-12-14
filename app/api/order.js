const request = require('superagent');
const baseURL = 'http://api.theweflex.com/api/orders'

function list (access_token) {
  return new Promise((resolve, reject) => {
    request.get(baseURL)
      .query({access_token})
      .end((error, res) => {
        if (error) {
          return reject(error);
        }
        try {
          let data = JSON.parse(res.text);
          return resolve(data);
        } catch (error) {
          return reject(error);
        }
      });
  });    
}

module.exports = {
  list
};
