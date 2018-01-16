"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UIFramework from '@weflex/weflex-ui';
import * as actions from '../../actions/signupAction';
import { injectIntl, intlShape } from 'react-intl';

class SignupForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      form: {
        name: '',
        username: '',
        phone: '',
        smscode: '',
      },
    };
  }
  onRequestSMSCode() {
    try {
      this.props.actions.requestSMSCode(this.state.form);
    } catch (err) {
      alert(err && err.message);
    }
  }

  onSignUp() {
    try {
      this.props.actions.smsRegisterNewOrgAndVenue(this.state.form);
      this.context.router.push('calendar');
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
            text={intl.formatMessage({id: 'studio_web_signup_input_smscode_request'})}
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
            text={intl.formatMessage({id: 'studio_web_signup_button_submit'})}
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
  actions: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
}

SignupForm.contextTypes = {
  router: PropTypes.object
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

module.exports = injectIntl(connect(null, mapDispatchToProps)(SignupForm));
