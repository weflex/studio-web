"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UIFramework from '@weflex/weflex-ui';
import * as actions from '../../../actions';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import hoistNonReactStatic from 'hoist-non-react-statics';

class TabUserPass extends React.Component {
  static title = <FormattedMessage id='studio_web_login_tab_userpass_title' />
  constructor(props, context) {
    super(props, context);
    this.state = {
      form: {
        username: '',
        password: '',
      },
    };
  }
  onLogin() {
    this.props.loginAction.loginThroughUsernamePassword(this.state.form);
    setTimeout(() => {
      window.location.href = '/calendar';
    }, 2000);

  }
  render() {
    const { intl } = this.props;
    const username_placeholder = intl.formatMessage({id: "studio_web_login_tab_userpass_input_username_placeholder"});
    const password_placeholder = intl.formatMessage({id:'studio_web_login_tab_userpass_input_password_placeholder'});
    const wait_message = intl.formatMessage({id:'studio_web_login_tab_smscode_message_wait'});
    return (
      <UIFramework className="login-smscode">
        <UIFramework.Row className="login-row username">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.username"
            placeholder={username_placeholder}
          />
        </UIFramework.Row>
        <UIFramework.Row className="login-row password">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.password"
            password={true}
            placeholder={password_placeholder}
          />
        </UIFramework.Row>
        <UIFramework.Row className="login-row">
          <UIFramework.Button
            flex={1}
            onClick={this.onLogin.bind(this)}
            text={intl.formatMessage({id: 'studio_web_login_tab_smscode_input_button_text'})}
            block={true}
            level="primary"
            disabled={!(this.state.form.password && this.state.form.username)}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

TabUserPass.propTypes = {
  loginAction: PropTypes.object.isRequired,
  userAction: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
}

TabUserPass.contextTypes = {
  router: PropTypes.object
};

function mapDispatchToProps(dispatch) {
  return {
    userAction: bindActionCreators(actions.userAction, dispatch),
    loginAction: bindActionCreators(actions.loginAction, dispatch),
  };
}
// copy over static properties to ensure messages
// appear correctly
const TabUserPassInjected = injectIntl(connect(null, mapDispatchToProps)(TabUserPass));
hoistNonReactStatic(TabUserPassInjected, TabUserPass);
module.exports = TabUserPassInjected;
