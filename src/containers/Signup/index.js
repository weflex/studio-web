"use strict";

import 'babel-polyfill';
import React from 'react';
import { connect } from 'react-redux';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../util/api';
import '../../styles/root-center.css';
import {FormattedMessage} from 'react-intl';
import SignupForm from '../../components/SignupForm';

class SignupIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        name: '',
        username: '',
        phone: '',
        smscode: '',
      },
    };
  }

  render() {
    let content;
    return (
      <div className="box-container">
        <div className="box signup">
          <h1><FormattedMessage id="studio_web_signup_title"/></h1>
          <div className="contents">
            <SignupForm />
          </div>
          <p className="login-link"><FormattedMessage id="studio_web_signup_login_message"/>
            <a href="/login"><FormattedMessage id="studio_web_signup_login_link"/></a>
          </p>
        </div>
      </div>
    );
  }
}

export default connect(state => state)(SignupIndex);
