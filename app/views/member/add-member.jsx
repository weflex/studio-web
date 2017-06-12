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
    };
  }
  async onSubmit() {
    try {
      const venue = await client.user.getVenueById();
      if (!this.props.member) {
        const response = await client.middleware('/transaction/add-member', Object.assign({
          venueId: venue.id,
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
      this.state.form.phone.length === 11);
  }
  async onChangePhone(event) {
    if (this.props.member) {
      return null;
    }
    const keyword = event.target.value;
    if (keyword.length > 7) {
      let users = await client.middleware('/search/users?phone=' + keyword);
      let formData = this.state.form;
      if (users.length >= 1) {
        let userData = users[0];
        formData.email = userData.email;
        formData.nickname = userData.nickname;
        formData.source = userData.source;
      } else {
        formData.email = '';
        formData.nickname = '';
        formData.source = '';
      }
      this.setState({form: formData});
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
