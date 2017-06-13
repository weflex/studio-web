import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: Object.assign({
        lifetime: {},
      }, props.member),
      hasPhone: 'none'
    };
    this.cache = {
      venueId: null
    }
  }

  async componentDidMount() {
    this.cache.venueId = ( await client.user.getVenueById() ).id;
  }

  async onSubmit() {
    try {
      if (!this.props.member) {
        const response = await client.middleware('/transaction/add-member', Object.assign({
          venueId: this.cache.venueId || ( await client.user.getVenueById() ).id,
        }, this.state.form), 'post');
        if (!response || !response.user) {
          throw new Error('Internal Server Error');
        }
      } else {
        // edit member object
        await client.member.update(this.props.member.id, {
          phone: this.state.form.phone,
          email: this.state.form.email,
          source: this.state.form.source,
          comment: this.state.form.comment,
          nickname: this.state.form.nickname,
        }, this.props.member.modifiedAt);
      }
      // empty the form if submit successfully
      this.setState({
        form: {
          lifetime: {},
        },
      });
      if (typeof this.props.onComplete === 'function') {
        await this.props.onComplete();
      }
    } catch (err) {
      console.error(err && err.stack);
      UIFramework.Modal.error({
        title: err.message,
        content: err.stack
      });
    }
  }
  get submitDisabled() {
    return !(this.state.form.nickname &&
      this.state.form.phone &&
      this.state.hasPhone &&
      this.state.form.phone.length === 11);
  }

  async onChangePhone(event) {
    // 规则：由于member和user表里面的phone字段是相互独立的，
    // 先判断该手机号在该场馆有没有会员，如果有会员则判定错误。
    // 如果通过条件，再判断该手机号是不是在user中有，并判断user中的手机号是否在该场馆关联的有会员，
    // 关联有会员的情况下判定错误
    const keyword = event.target.value;
    if (keyword.length == 11) {
      const venueId = this.cache.venueId || ( await client.user.getVenueById() ).id;

      const memberList = await client.member.list({
        where: {
          venueId,
          phone: keyword,
        }
      });

      let {form, hasPhone } = this.state;

      if(memberList.length <= 0 || (memberList.length > 0 && this.props.member && memberList[0].phone === this.props.member.phone) ){
        const userList = await client.user.list({
          where: {
            phone: keyword,
          },
          include: {
            relation: 'members',
            scope: {
              where: {
                venueId,
                trashedAt: { exists: false }
              }
            }
          }
        });

        if(userList.length > 0) {
          const user = userList[0];
          if(user.members.length > 0 && user.members[0].phone !== keyword) {
            hasPhone = '';
          } else {
            form.email = user.email;
            form.nickname = user.nickname;
            form.source = user.source;
            hasPhone = 'none';
          }
        } else {
          form.email = '';
          form.nickname = '';
          form.source = '';
          hasPhone = 'none';
        }
      } else {
        hasPhone = '';
      }

      this.setState({form, hasPhone});
    }
  }
  render() {
    return (
      <UIFramework className="membership-add">
        <UIFramework.Row name="会员联系方式" hint="会员的手机号码以及电子邮箱地址">
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.phone"
            onChange={this.onChangePhone.bind(this)}
            value={this.state.form.phone}
            placeholder="11位手机号码"
          />
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.email"
            value={this.state.form.email}
            placeholder="可选填：example@getweflex.com"
          />
          <span style={{color:'#f00', display: this.state.hasPhone}}>会员手机号已存在</span>
        </UIFramework.Row>
        <UIFramework.Row name="会员姓名" hint="会员的名字">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.nickname"
            value={this.state.form.nickname}
          />
        </UIFramework.Row>
        <UIFramework.Row name="会员来源" hint="如：大众点评、朋友推荐等">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.source"
            value={this.state.form.source}
          />
        </UIFramework.Row>
        <UIFramework.Row name="备注" hint="给你的会员添加备注">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.comment"
            value={this.state.form.comment}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          {(() => {
            let text = this.props.member ? '保存修改' : '添加会员';
            return <UIFramework.Button text={text}
              onClick={this.onSubmit.bind(this)}
              disabled={this.submitDisabled}
            />
          })()}
        </UIFramework.Row>
      </UIFramework>
    );
  }
}
