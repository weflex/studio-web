import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';
import randomize from 'randomatic';

export default class extends React.Component {
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
        let user = await client.user.list({
          where:{
            phone:form.phone
          }
        })
        let userId = ''
        if(user[0]){
         userId = user[0].id
        } else {
          let newUser = {
            sex: 'female',
            phone: form.phone,
            email: form.nickname + '@register.theweflex.com',
            nickname: form.nickname,
            username: form.nickname,
            password: randomize('Aa0', 8),
          };
          const user = await client.user.create(newUser)
          userId = user.id
        }
        await client.member.update(memberId, {
          venueId:venueId,
          phone: form.phone,
          email: form.email,
          source: form.source,
          comment: form.comment,
          nickname: form.nickname,
          userId:userId
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
    const { type } = this.props;
    const {form, hasPhone} = this.state;

    return (
      <UIFramework className="membership-add">
        <UIFramework.Row name="会员联系方式" hint="会员的手机号码以及电子邮箱地址">
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.phone"
            onChange={this.onChangePhone.bind(this)}
            value={form.phone}
            placeholder="11位手机号码"
          />
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.email"
            value={form.email}
            placeholder="可选填：example@getweflex.com"
          />
          <span style={{ color: '#f00', display: hasPhone? '': 'none' }}>会员手机号已存在</span>
        </UIFramework.Row>
        <UIFramework.Row name="会员姓名" hint="会员的名字">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.nickname"
            value={form.nickname}
          />
        </UIFramework.Row>
        <UIFramework.Row name="会员来源" hint="如：大众点评、朋友推荐等">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.source"
            value={form.source}
          />
        </UIFramework.Row>
        <UIFramework.Row name="备注" hint="给你的会员添加备注">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.comment"
            value={form.comment}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button
            text={type==='edit'? '保存修改': '添加会员'}
            onClick={this.onSubmit.bind(this)}
            disabled={!(form.nickname && form.phone && !hasPhone && form.phone.length === 11)}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}
