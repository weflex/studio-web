const React = require('react');
const User = require('../api/user');
const QRCode = require('qrcode.react');

require('./index.css');

class Login extends React.Component {
  constructor () {
    User.logout();
    super();
  }
  render () {
    return (
      <div className='login-view'>
        <h1>WeFlex</h1>
        <div className='hint'>扫描二维码登录</div>
        <div id='qrcode-container'>
          <QRCode value={"http://api-staging.theweflex.com/auth/wechat?state=test"}
                  size={128}
                  bgColor={"#fff"}
                  fgColor={"#000"} />
        </div>
      </div>
    );
  }
}

module.exports = Login;
