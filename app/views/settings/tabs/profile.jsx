"use strict"

import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../../api';

class AvatarUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uptoken: null,
    };
  }
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const token = await client.resource.token();
    this.setState({
      uptoken: token.uptoken,
    });
  }
  async onAvatarUploaded(result, file) {
    let user = client.user.user;
    await client.user.update(user.id, {
      avatarId: result.id
    }, user.modifiedAt);
    location.href = '/calendar';
  }
  onError(err) {
    console.error(err);
  }
  render() {
    return (
      <UIFramework.Upload 
        token={this.state.uptoken} 
        onSuccess={this.onAvatarUploaded}
        onError={this.onError}>
        <UIFramework.Image size={70} src={this.props.src} style={{marginRight: '10px'}} />
        <UIFramework.Cell>
          <UIFramework.Button>上传头像</UIFramework.Button>
          <UIFramework.Divider />
          <UIFramework.Text text="绑定微信帐号可以微信扫一扫登录" />
        </UIFramework.Cell>
      </UIFramework.Upload>
    );
  }
}

class PhoneValidator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: this.props.phone,
      smscode: null,
    };
  }
  requestSmsCode() {
    client.user.smsRequest(this.state.phone);
  }
  async validate() {
    // const res = await client.user.smsLogin(this.state.phone, this.state.smscode);
  }
  render() {
    return (
      <div>
        <UIFramework.Row name="手机号码" hint="修改手机号码需要重新验证手机号">
          <UIFramework.TextInput
            flex={0.8}
            bindStateCtx={this}
            bindStateName="phone"
            value={this.state.phone}
          />
          <UIFramework.Button 
            flex={0.2} 
            interval={30} 
            text="获取验证码"
            onClick={this.requestSmsCode.bind(this)}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={0.8}
            bindStateCtx={this}
            bindStateName="smscode"
            placeholder="输入验证码"
          />
          <UIFramework.Button
            flex={0.2}
            text="验证"
            disabled={!this.state.smscode || !this.state.phone}
            onClick={this.validate.bind(this)}
          />
        </UIFramework.Row>
      </div>
    );
  }
}

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
    };
  }
  async componentWillMount() {
    const user = client.user.user;
    this.setState({
      form: {
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }
  render() {
    return (
      <div className="detail-cards">
        <div className="detail-cards-left">
          <div className="detail-card">
            <UIFramework>
              <UIFramework.Row>
                <AvatarUploader src={this.state.form.avatar} />
              </UIFramework.Row>
              <UIFramework.Row name="姓名" hint="更换姓名">
                <UIFramework.TextInput
                  flex={1} 
                  bindStateCtx={this}
                  bindStateName="form.nickname"
                  value={this.state.form.nickname}
                />
              </UIFramework.Row>
              <UIFramework.Row>
                <PhoneValidator phone={this.state.form.phone} />
              </UIFramework.Row>
              <UIFramework.Row name="邮箱">
                <UIFramework.TextInput 
                  flex={1}
                  bindStateCtx={this} 
                  bindStateName="form.email" 
                  value={this.state.form.email}
                />
              </UIFramework.Row>
            </UIFramework>
          </div>
        </div>
        <div className="detail-cards-right">
          <div className="detail-card">
            <h3>个人信息完善度</h3>
            <UIFramework>
              <UIFramework.Row>
                <UIFramework.Progress flex={1} percent={90} />
              </UIFramework.Row>
            </UIFramework>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Profile;
