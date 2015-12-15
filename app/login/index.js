const React = require('react');
const User = require('../api/user');

async function onSubmit (e) {
  e.preventDefault();
  let username = document.getElementById('login-username').value;
  let password = document.getElementById('login-password').value;
  let token;
  try {
    token = await User.login(username, password);
    alert('login success'); // place-holder
  } catch (error) {
    alert ('login failed'); // ditto
  }
}

class Login extends React.Component {
  render () {
    return (
      <form>
        <div>
          <label>username</label>
          <input type='text' id='login-username' />
        </div>
        <div>
          <label>password</label>
          <input type='password' id='login-password' />
        </div>
        <button type="submit" onClick={onSubmit}>Login</button>
      </form>
    );
  }
}

module.exports = Login;
