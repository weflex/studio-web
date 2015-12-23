const React = require('react');
const User = require('../api/user');

class Login extends React.Component {
  constructor () {
    User.logout();
    super();
  }
  async onsubmit (e) {
    e.preventDefault();
    await User.login(this.username.value, this.password.value);
    location.href = '/';
  }
  render () {
    return (
      <form>
        <div>
          <label>username</label>
          <input type='text' id='login-username' 
            ref={(node) => {
              if (node) {
                this.username = node;
              }
            }}
          />
        </div>
        <div>
          <label>password</label>
          <input type='password' id='login-password'
            ref={(node) => {
              if (node) {
                this.password = node 
              }
            }}
          />
        </div>
        <button type="submit" onClick={this.onsubmit.bind(this)}>Login</button>
      </form>
    );
  }
}

module.exports = Login;
