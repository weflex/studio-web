"use strict";

import _ from 'lodash';
import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../util/api';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

class TrainerProfile extends React.Component {
  constructor(props) {
    super(props);

    const trainer = props.trainer || {};
    this.state = {
      trainer,
      venueId: trainer && trainer.venueId || '',
      orgId: trainer && trainer.orgId || '',
      phoneInputDisable: ( Object.keys(props.trainer) ).length > 0,
    };
  }
  async componentDidMount () {
    const venue = await client.user.getVenueById();
    this.setState({
      venueId: venue.id,
      orgId: venue.orgId,
    });
  }
  async onSubmit() {
    const isNewInstance = (undefined === this.state.trainer.id);
    const {id, phone, name, description, employmentStatus, modifiedAt} = this.state.trainer;
    try {
      if (isNewInstance) {
        await client.middleware('/transaction/invite/trainer', {
          orgId: client.user.org.id,
          venueId: this.state.venueId,
          phone,
          fullname: {
            first: name,
            last: '',
          },
          employmentStatus,
          description,
        }, 'post');
      } else {
        await client.collaborator.update(id, {
          fullname: {
            first: name,
            last: '',
          },
          employmentStatus,
          description,
        }, modifiedAt);
      }

      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete(this.state.trainer);
      }
    } catch (err) {
      alert(err.message);
    }
  }
  get submitDisabled() {
    return !(this.state.trainer.name &&
      this.state.trainer.employmentStatus &&
      this.state.trainer.phone &&
      this.state.trainer.phone.length === 11);
  }
  render() {
    const { intl } = this.props;
    const trainer = this.state.trainer;
    const isNewInstance = (undefined === trainer.id);
    const employmentStatuses = [
      {
        text: intl.formatMessage({id:"studio_web_trainer_management_profile_employment_status_full_time"}),
        value: '全职',
        key: 1,
      },
      {
        text: intl.formatMessage({id:"studio_web_trainer_management_profile_employment_status_part_time"}),
        value: '兼职',
        key: 2,
      },
    ];
    return (
      <UIFramework className="trainer-profile">
        <UIFramework.Row name={intl.formatMessage({id: "studio_web_trainer_management_profile_field_phone_name"})}
                         hint={intl.formatMessage({id: "studio_web_trainer_management_profile_field_phone_hint"})}>
          <UIFramework.TextInput
            flex={1}
            value={trainer.phone}
            bindStateCtx={this}
            bindStateName="trainer.phone"
            placeholder={intl.formatMessage({id:"studio_web_trainer_management_profile_field_phone_placeholder"})}
            disabled={this.state.phoneInputDisable}
          />
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_name"})}
                         hint={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_hint"})}>
          <UIFramework.TextInput
            flex={1}
            value={trainer.name}
            bindStateCtx={this}
            bindStateName="trainer.name"
            placeholder={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_placeholder"})}
          />
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_type"})}
                         hint={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_type_hint"})}>
          <UIFramework.Select
            flex={1}
            value={trainer.employmentStatus}
            bindStateCtx={this}
            bindStateName="trainer.employmentStatus"
            options={employmentStatuses}
            placeholder={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_type_placeholder"})}
          />
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_description"})}
                         hint={intl.formatMessage({id: "studio_web_trainer_management_profile_field_trainer_description_hint"})}>
          <UIFramework.TextInput
            flex={1}
            value={trainer.description}
            bindStateCtx={this}
            bindStateName="trainer.description"
            multiline={true}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button text={intl.formatMessage({id: "studio_web_btn_save"})}
                              onClick={this.onSubmit.bind(this)}
                              disabled={this.submitDisabled}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

TrainerProfile.propTypes = {
  intl: intlShape.isRequired,
}

module.exports = injectIntl(TrainerProfile, { withRef: true });
