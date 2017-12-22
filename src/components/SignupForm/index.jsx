"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../util/api';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

class SignupForm extends React.Component {
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
  async onRequestSMSCode() {
    try {
      await client.user.smsRequest(this.state.form.phone);
    } catch (err) {
      alert(err && err.message);
    }
  }
  async onSignUp() {
    try {
      await client.user.smsRegisterNewOrgAndVenue(
        this.state.form.phone,
        this.state.form.smscode,
        {
          name: this.state.form.name,
          username: this.state.form.username,
        }
      );
      window.location.href = '/calendar';
    } catch (err) {
      alert(err && err.message + ', please contact: 400-8566-203');
    }
  }
  get disableRequestSMSCode() {
    return !(this.state.form.username &&
      this.state.form.name &&
      this.state.form.phone &&
      this.state.form.phone.length === 11);
  }
  get disableSignUp() {
    return this.disableRequestSMSCode ||
      !this.state.form.smscode;
  }
  render() {
    const {intl} = this.props;
    const studioname_placeholder = intl.formatMessage({id:'studio_web_signup_studio_name'});
    const username_placeholder = intl.formatMessage({id:'studio_web_signup_input_username_placeholder'});
    const phone_placeholder = intl.formatMessage({id:'studio_web_signup_input_phone_placeholder'});
    const verify_placeholder = intl.formatMessage({id: 'studio_web_signup_input_smsmcode_verify_placeholder'});
    const wait_message = intl.formatMessage({id:'studio_web_login_tab_smscode_message_wait'});
    return (
      <UIFramework className="contents">
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.name"
            placeholder={studioname_placeholder}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.username"
            placeholder={username_placeholder}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={0.7}
            bindStateCtx={this}
            bindStateName="form.phone"
            placeholder={phone_placeholder}
          />
          <UIFramework.Button
            flex={0.3}
            text={<FormattedMessage id="studio_web_signup_input_smscode_request"/>}
            interval={60}
            intervalFormat={(c) => `(${wait_message + c})`}
            disabled={this.disableRequestSMSCode}
            onClick={this.onRequestSMSCode.bind(this)}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.smscode"
            placeholder={verify_placeholder}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button
            flex={1}
            text={<FormattedMessage id="studio_web_signup_button_submit"/>}
            block={true}
            level="primary"
            onClick={this.onSignUp.bind(this)}
          />
        </UIFramework.Row>
      </UIFramework>
      )
    }
}

SignupForm.propTypes = {
  intl: intlShape.isRequired
}

module.exports = injectIntl(SignupForm);
