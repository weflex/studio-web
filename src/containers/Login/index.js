"use strict";

import 'babel-polyfill';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { client } from '../../util/api';
import { Link } from 'react-router';
import '../../styles/root-center.css';
import './index.css';
import UIFramework from '@weflex/weflex-ui';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

const queryString = require('query-string');

const sourceTabs = [
  require('../../components/Login/Tabs/smscode'),
  // require('../../components/Login/Tabs/qrcode'),
  require('../../components/Login/Tabs/userpass'),
];

class LoginIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
    };
  }
  async componentWillMount() {
    await client.user.logout();
  }
  onSelect(key) {
    this.setState({
      selected: key
    });
  }
  componentDidMount() {
    const query = queryString.parse(location.search);
    if (query.msg) {
      let errorMessage;
      switch(query.msg){
        case '401':
        errorMessage = <FormattedMessage id="studio_web_login_account_does_not_exist"/>;
        break;
        case 'login failed':
        errorMessage = <FormattedMessage id="studio_web_login_account_or_password_wrong"/>;
        break;
        default:
        errorMessage = <FormattedMessage id="studio_web_login_failed"/>;
        break;
      }
      UIFramework.Modal.error({
        title: this.props.intl.formatMessage({id: 'studio_web_login_tab_smscode_error_login_failed_title'}),
        content: errorMessage,
        onOk: () => this.context.router.push('login')
      });
    }
  }
  render() {
    let tabs = [];
    let content;
    sourceTabs.forEach((component, key) => {
        let className;
        if (key === this.state.selected) {
          className = 'selected';
          content = React.createElement(component);
        }
        tabs.push(
          <li key={key}
            className={className}
            onClick={this.onSelect.bind(this, key)}>
            {component.title}
          </li>
        );
    });
    return (
      <div className="box-container">
        <div className="box login">
          <ul className="tabs">{tabs}</ul>
          <div className="contents">
            {content}
          </div>
          <p className="login-link">
            <FormattedMessage id="studio_web_login_tab_signup_message"/>
            <Link to="/signup">
              <FormattedMessage id="studio_web_login_tab_signup_link"/>
            </Link>
          </p>
        </div>
      </div>
    );
  }
}

LoginIndex.propTypes = {
  intl: intlShape.isRequired,
}

LoginIndex.contextTypes = {
  router: PropTypes.object
}

export default connect(state => state)(injectIntl(LoginIndex));
