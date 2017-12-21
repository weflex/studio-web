"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../../util/api';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import hoistNonReactStatic from 'hoist-non-react-statics';

class TabSMSCode extends React.Component {
  static title = <FormattedMessage id='studio_web_login_tab_smscode_title' />
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      smscode: '',
    };
  }
  onRequestSMSCode() {
    client.user.smsRequest(this.state.phone);
  }
  async onLogin() {
    try {
      const res = await client.user.smsLogin(this.state.phone, this.state.smscode);
    } catch (err) {
    UIFramework.Modal.error({
      title: <FormattedMessage id='studio_web_login_tab_smscode_error_login_failed_title'/>,
      content: <FormattedMessage id='studio_web_login_tab_smscode_error_login_failed_content'/>,
    });
    }
    window.location.href = '/calendar';
  }
  render() {
    const { intl } = this.props;
    const phone_placeholder = intl.formatMessage({id: "studio_web_login_tab_smscode_input_phone_placeholder"});
    const smscode_placeholder = intl.formatMessage({id:'studio_web_login_tab_smscode_input_smscode_placeholder'})
    const wait_message = intl.formatMessage({id:'studio_web_login_tab_smscode_message_wait'})
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
            text={<FormattedMessage id="studio_web_login_tab_smscode_input_button_get_verification_code"/>}
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
            text={<FormattedMessage id="studio_web_login_tab_smscode_input_button_text"/>}
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
  intl: intlShape.isRequired
}
// copy over static properties to ensure messages
// appear correctly
const TabSMSCodeInjected = injectIntl(TabSMSCode);
hoistNonReactStatic(TabSMSCodeInjected, TabSMSCode);
module.exports = TabSMSCodeInjected;
