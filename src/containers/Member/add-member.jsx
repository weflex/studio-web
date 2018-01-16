import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../util/api';
import { injectIntl, intlShape } from 'react-intl';

class AddNewMember extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf([ 'add', 'edit' ]).isRequired,
    memberId: PropTypes.string,
    onComplete: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      form: {},
      hasPhone: false,
    };

    this.cache = {
      venueId: null,
      beforPhone: '',
    }
  }

  async componentDidMount() {
    this.cache.venueId = (await client.user.getVenueById()).id;
    this.getMember(this.props.memberId);
  }

  componentWillReceiveProps(nextProps) {
    this.getMember(nextProps.memberId);
  }

  async getMember(memberId) {
    const member = memberId? ( await client.member.list({
      where: {
        id: memberId,
      },
      include: 'user',
    }) )[0]: {};
    this.cache.beforPhone = member.phone;
    this.setState({form: member, hasPhone: false});
  }

  async onSubmit() {
    const { type, memberId, onComplete } = this.props;
    const { form } = this.state;
    const { venueId } = this.cache;
    try {
      if (type === 'add') {
        const response = await client.middleware('/transaction/add-member', {venueId, ...form}, 'post');
        if (!response || !response.user) {
          throw new Error('Internal Server Error');
        }
      } else if(type === 'edit') {
        await client.user.update(form.user.id, {
          phone: form.phone,
        }, form.user.modifiedAt);
        await client.member.update(memberId, {
          phone: form.phone,
          email: form.email,
          source: form.source,
          comment: form.comment,
          nickname: form.nickname,
        }, form.modifiedAt);

      }
      if (typeof onComplete === 'function') {
        await onComplete();
      }
    } catch (err) {
      console.error(err && err.stack);
      UIFramework.Modal.error({
        title: err.message,
        content: err.stack
      });
    }
  }

  async onChangePhone(event) {
    const phone = event.target.value;
    if (phone.length == 11) {
      const { type } = this.props;
      let { form, hasPhone } = this.state;
      const { venueId, beforPhone } = this.cache;

      const memberList = await client.member.list({
        where: {
          venueId,
          phone,
        }
      });

      this.setState({ hasPhone: memberList.length > 0 && memberList[0].phone !== beforPhone });
    }
  }

  render() {
    const { type, intl } = this.props;
    const {form, hasPhone} = this.state;

    return (
      <UIFramework className="membership-add">
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_phone_name'})}
                         hint={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_phone_hint'})}>
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.phone"
            onChange={this.onChangePhone.bind(this)}
            value={form.phone}
            placeholder={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_phone_placeholder'})}
          />
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.email"
            value={form.email}
            placeholder={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_email_placeholder'})}
          />
          <span style={{ color: '#f00', display: hasPhone? '': 'none' }}>
            {intl.formatMessage({id: 'studio_web_member_modal_add_member_error_phone_exist'})}
          </span>
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_nickname_name'})}
                         hint={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_nickname_hint'})}>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.nickname"
            value={form.nickname}
          />
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_source_name'})}
                         hint={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_source_hint'})}>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.source"
            value={form.source}
          />
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_remarks_name'})}
                         hint={intl.formatMessage({id: 'studio_web_member_modal_add_member_field_remarks_hint'})}>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.comment"
            value={form.comment}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button
            text={
              type==='edit' ?
              intl.formatMessage({id: 'studio_web_member_modal_add_member_btn_edit'}) :
              intl.formatMessage({id: 'studio_web_member_modal_add_member_btn_save'})
            }
            onClick={this.onSubmit.bind(this)}
            disabled={!(form.nickname && form.phone && !hasPhone && form.phone.length === 11)}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

AddNewMember.propTypes = {
  intl: intlShape.isRequired,
}

export default injectIntl(AddNewMember);
