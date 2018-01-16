import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../util/api';
import { keyBy, intersectionBy } from 'lodash';
import { format, startOfDay, endOfDay, addDays, addMonths, addYears, isSameDay } from 'date-fns';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

class AddMembershipCard extends React.Component {
  static propTypes = {
    operation   : React.PropTypes.string,
    member      : React.PropTypes.object.isRequired,
    data        : React.PropTypes.object,
    onComplete  : React.PropTypes.func,
    intl        : intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    let operation = 'add';
    let form = {
      name: null,
      accessType: null,
      price: null,
      available: null,
      startsAt: null,
      expiresAt: null,
      packageId: null,
      salesId: null,
      venueId: props.member.venueId,
    };

    if(props.data) {
      operation = 'edt';
      form = Object.assign(form, props.data);
    }

    this.state = {
      operation,
      form,
      packageOptions: [],
      salesOptions: [],
    };
    this.cache = {
      packages: {},
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onChangePackage = this.onChangePackage.bind(this);
    this.onChangeStartsAt = this.onChangeStartsAt.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    let form = this.state.form, operation = 'add';
    if(nextProps.data) {
      operation = 'edt';
      form = Object.assign(form, nextProps.data);
    }
    this.setState({operation, form});
  }

  async componentWillMount() {
    const { operation } = this.state;
    const { intl } = this.props;
    let { form } = this.state;
    let { packages } = this.cache;
    const venueId = form.venueId;

    const packageList = await client.classPackage.list({
      where: {
        venueId,
      }
    });
    const packageOptions = packageList.map((item) => {
      return {
        text: item.name,
        value: item.id,
        data: item,
      };
    });
    this.cache.packages = keyBy(packageList, 'id');

    const salesOptions = ( await client.collaborator.list({
      where: {
        venueId
      }
    }) ).map((item) => {
      return {
        text  : item.fullname.first + item.fullname.last,
        value : item.id,
        data  : item,
      };
    });
    salesOptions.unshift({
      text: intl.formatMessage({id: 'studio_web_membership_detail_add_member_sales_default_option'}),
      value: null,
      data: null
    });

    this.setState({
      form,
      packageOptions,
      salesOptions,
    });
  }

  getExpiresAt(startsAt, lifetime) {
    let expiresAt = null;

    switch(lifetime.scale) {
      case 'day':
        expiresAt = addDays(startsAt, lifetime.value);
        break;
      case 'month':
        expiresAt = addMonths(startsAt, lifetime.value);
        break;
      case 'year':
        expiresAt = addYears(startsAt, lifetime.value);
        break;
    };
    return addDays(expiresAt, -1);
  }

  onChangePackage(event) {
    let {form} = this.state;
    const curr = this.cache.packages[form.packageId];

    form.name = curr.name;
    form.accessType = curr.accessType;
    form.price = curr.price;
    form.available = curr.passes || null;
    form.startsAt = new Date();
    form.expiresAt = this.getExpiresAt(form.startsAt, curr.lifetime);

    this.setState({form});
    this.forceUpdate();
  }

  onChangeStartsAt(event) {
    let {form} = this.state;
    const curr = this.cache.packages[form.packageId];

    form.expiresAt = this.getExpiresAt(form.startsAt, curr.lifetime);
    this.setState({form});
    this.forceUpdate();
  }

  async onSubmit() {
    const { operation, form } = this.state;
    const { data, onComplete, member } = this.props;
    const membership = {
      memberName: member.nickname,
      name: form.name,
      accessType: form.accessType,
      price: form.price,
      startsAt: startOfDay(form.startsAt),
      expiresAt: endOfDay(form.expiresAt),
      packageId: form.packageId,
      salesId: (form.salesId === "（空）" || form.salesId === "None") ? null : form.salesId,
      venueId: form.venueId,
      memberId: member.id,
    };
    if(form.available || form.available === 0) {
      membership.available = form.available;
    }
    if (operation === 'edt') {
      if(data.isExpiresAt && data.expiresAt != form.expiresAt){
          membership.isExpiresAt=false
      }
      await client.membership.update(data.id, membership, data.modifiedAt);

      if(!isSameDay(membership.startsAt, data.startsAt) || !isSameDay(membership.expiresAt, data.expiresAt) || membership.available && membership.available !== data.available){
        let memberOperation = {
          memberId: membership.memberId,
          membershipId: form.id,
          record: '管理员编辑了会卡:' + membership.name,
        }

        if(!isSameDay(membership.startsAt, data.startsAt)){
          memberOperation.record += '<br/>生效日期:' + format(data.startsAt, 'YYYY-MM-DD') + '变更为' + format(membership.startsAt, 'YYYY-MM-DD');
        }
        if(!isSameDay(membership.expiresAt, data.expiresAt)){
          memberOperation.record += '<br/>到期日期:' + format(data.expiresAt, 'YYYY-MM-DD') + '变更为' + format(membership.expiresAt, 'YYYY-MM-DD');
        }
        if(membership.available && membership.available !== data.available){
          memberOperation.record += '<br/>剩余次数:' + data.available + '次变更为' + membership.available;
        }

        await client.operation.create(memberOperation);
      }
    } else if(operation === 'add') {
      let memberOperation = {
        memberId: membership.memberId,
        record: '用户购买了会卡:' + membership.name + '<br/>生效日期:' + format(membership.startsAt, 'YYYY-MM-DD') + '<br/>到期日期:' + format(membership.expiresAt, 'YYYY-MM-DD'),
      }
      if(membership.available) {
        memberOperation.record += '<br/>有效次数:' + membership.available;
      };
      await client.membership.create(membership);
      await client.operation.create(memberOperation);
    }

    if (typeof onComplete === 'function') {
      await onComplete();
    }
  }

  onDelete() {
    const { data, onComplete, intl } = this.props;
    const title = intl.formatMessage(
      {id: 'studio_web_membership_detail_add_member_modal_delete_title'}
    );
    const content = intl.formatMessage(
      { id: 'studio_web_membership_detail_add_member_modal_delete_content' },
      { member: this.props.member.nickname }
    );
    UIFramework.Modal.confirm({
      title: title,
      content: content,
      onOk: async () => {
        try {
          await client.membership.delete(data.id, data.modifiedAt);
          if (typeof onComplete === 'function') {
            onComplete();
          }
        } catch (error) {
          if (error.code === 'RESOURCE_EXPIRED') {
            UIFramework.Message.error(
              intl.formatMessage({id: 'studio_web_error_resource_expired'})
            );
          } else {
            UIFramework.Message.error(
              intl.formatMessage({id: 'studio_web_error_unknown_error'})
            );
          }
          console.error(error);
        }
      }
    });
  }

  render() {
    const { operation, form, packageOptions, salesOptions } = this.state;
    const { member, intl } = this.props;

    return (
      <UIFramework>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_membership_detail_modal_add_member_name'})}>
          <UIFramework.TextInput flex={1} value={member.nickname} disabled />
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_membership_detail_add_member_card_name'})}
                         hint={intl.formatMessage({id: 'studio_web_membership_detail_add_member_card_hint'})}>
          {
            operation === 'edt'
              ? <UIFramework.TextInput
                flex={1}
                value={form.name}
                disabled="true"
              />
              : <UIFramework.Select
                flex={1}
                bindStateCtx={this}
                bindStateName="form.packageId"
                value={ form.packageId }
                options={packageOptions}
                onChange={this.onChangePackage}
              />
          }
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_membership_detail_add_member_price'})}>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.price"
            bindStateType={Number}
            value={form.price}
          />
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_membership_detail_add_member_sales'})}>
          <UIFramework.Select
            flex={1}
            bindStateCtx={this}
            bindStateName="form.salesId"
            value={form.salesId}
            options={salesOptions}
          />
        </UIFramework.Row>
        {
          (form.accessType === 'multiple')
          ? <UIFramework.Row name={
              operation==='add' ?
                intl.formatMessage({id: 'studio_web_membership_detail_add_member_multiple_times_number'}) :
                intl.formatMessage({id: 'studio_web_membership_detail_add_member_multiple_times_remaining'})
            }>
              <UIFramework.TextInput
                flex={1}
                bindStateCtx={this}
                bindStateType={Number}
                bindStateName="form.available"
                value={form.available}
              />
            </UIFramework.Row>
          : ''
        }
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_membership_detail_add_member_validity_name'})}
                         hint={intl.formatMessage({id: 'studio_web_membership_detail_add_member_validity_hint'})}>
          <UIFramework.DateInput
            flex={0.45}
            bindStateCtx={this}
            bindStateName="form.startsAt"
            onChange={this.onChangeStartsAt}
            value={ format(form.startsAt, 'YYYY-MM-DD') }
          />
          <span style={{'display': 'inline-block', 'width': '8%', 'lineHeight': '30px', 'textAlign': 'center', 'marginRight': '5px'}}>
            <FormattedMessage id="studio_web_membership_detail_add_member_validity_upto"/>
          </span>
          <UIFramework.DateInput
            flex={0.45}
            bindStateCtx={this}
            bindStateName="form.expiresAt"
            value={ format(form.expiresAt, 'YYYY-MM-DD') }
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button
            key="save"
            text={
              operation === 'add' ?
                intl.formatMessage({id: 'studio_web_membership_detail_add_member_confirm_add'}) :
                intl.formatMessage({id: 'studio_web_membership_detail_add_member_save_member_info'})
              }
            onClick={this.onSubmit}
            disabled={!( form.packageId && (form.price === 0 || form.price ) && form.startsAt && form.expiresAt)}
          />
          {
            (operation === 'edt')
            ? <UIFramework.Button
                key="del"
                text={intl.formatMessage({id: 'studio_web_membership_detail_add_member_delete_btn'})}
                onClick={this.onDelete}
              />
            : ""
          }
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

export default injectIntl(AddMembershipCard);
