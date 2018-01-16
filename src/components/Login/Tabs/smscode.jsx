"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UIFramework from '@weflex/weflex-ui';
import * as actions from '../../../actions/loginAction';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import hoistNonReactStatic from 'hoist-non-react-statics';
import isEmpty from 'lodash/isEmpty';

class TabSMSCode extends React.Component {
  static title = <FormattedMessage id='studio_web_login_tab_smscode_title' />
  constructor(props, context) {
    super(props, context);
    this.state = {
      phone: '',
      smscode: '',
    };
  }
  onRequestSMSCode() {
    this.props.actions.requestSMSCode({phone: this.state.phone});
  }
  onLogin() {
    try {
      const res = this.props.actions.loginThroughSmsCode({phone: this.state.phone, smscode: this.state.smscode});
      if (isEmpty(res)) {
        setTimeout(() => {
          window.location.href = '/calendar';
        }, 2000);
      }
    } catch (err) {
      UIFramework.Modal.error({
        title: this.props.intl.formatMessage({id: 'studio_web_login_tab_smscode_error_login_failed_title'}),
        content: this.props.intl.formatMessage({id: 'studio_web_login_tab_smscode_error_login_failed_content'}),
      });
    }
  }
  render() {
    const { intl } = this.props;
    const phone_placeholder = intl.formatMessage({id: "studio_web_login_tab_smscode_input_phone_placeholder"});
    const smscode_placeholder = intl.formatMessage({id:'studio_web_login_tab_smscode_input_smscode_placeholder'});
    const wait_message = intl.formatMessage({id:'studio_web_login_tab_smscode_message_wait'});
    return (
      <UIFramework>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={0.7}
            type="text"
            ref="phone"
            bindStateCtx={this}
            bindStateName="phone"
            placeholder={phone_placeholder}
          />
          <UIFramework.Button
            flex={0.3}
            text={intl.formatMessage({id: 'studio_web_login_tab_smscode_input_button_get_verification_code'})}
            interval={30}
            intervalFormat={(c) => `(${wait_message + c})`}
            onClick={this.onRequestSMSCode.bind(this)}
            disabled={!this.state.phone || this.state.phone.length !== 11}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="smscode"
            placeholder={smscode_placeholder}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button
            flex={1}
            text={intl.formatMessage({id: 'studio_web_login_tab_smscode_input_button_text'})}
            block={true}
            level="primary"
            onClick={this.onLogin.bind(this)}
            disabled={!(this.state.phone && this.state.smscode)}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

TabSMSCode.propTypes = {
  actions: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  location: PropTypes.object
}

TabSMSCode.contextTypes = {
  router: PropTypes.object
};

function mapStateToProps(state){
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

// copy over static properties to ensure messages
// appear correctly
const TabSMSCodeInjected = injectIntl(connect(mapStateToProps, mapDispatchToProps)(TabSMSCode));
hoistNonReactStatic(TabSMSCodeInjected, TabSMSCode);
module.exports = TabSMSCodeInjected;
