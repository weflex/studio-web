"use strict";

import React from 'react';
import QRCode from 'qrcode.react';
import { client } from '../../api';

class TabQRCode extends React.Component {
  static title = '微信授权登录';
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="login-qrcode">
        <div className="login-qrcode-wrapper">
          <QRCode 
            size={180}
            value="http://www.getweflex.com" 
          />
        </div>
        <div className="login-qrcode-hint">微信扫描登录</div>
      </div>
    );
  }
}

module.exports = TabQRCode;
