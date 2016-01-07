require('babel-polyfill');
const React = require('react');
const ReactDOM = require('react-dom');
const User = require('../api/user');
const QRCode = require('qrcode.react');

require('./index.css');

class Login extends React.Component {
  constructor(props) {
    super();
    this.state = {
      pendingId: null
    };
  }
  async componentWillMount() {
    await User.logout();
    this.setState({
      pendingId: await User.pending(this.loggedIn)
    });
  }
  loggedIn() {
    location.href = '/';
  }
  render() {
    let qrcode = null;
    if (this.state.pendingId) {
      const url = 'http://api-staging.theweflex.com/auth/wechat?state=' + btoa('qrcode:' + this.state.pendingId);
      qrcode = <QRCode value={url} size={128} bgColor="#fff" fgColor="#000" />;
    }
    return (
      <div className='login-view'>
        <h1>WeFlex</h1>
        <div className='hint'>扫描二维码登录</div>
        <div id='qrcode-container'>
          {qrcode}
        </div>
      </div>
    );
  }
}


(function () {
  ReactDOM.render(
    <Login />,
    document.getElementById('root-container'));
})();
