"use strict"

import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../../api';

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
      }
    });
  }
  render() {
    return (
      <div className="detail-cards">
        <div className="detail-cards-left">
          <div className="detail-card">
            <UIFramework>
              <UIFramework.Row>
                <UIFramework.Image size={70} src={this.state.form.avatar} style={{marginRight: '10px'}} />
                <UIFramework.Upload>
                  <UIFramework.Button>上传头像</UIFramework.Button>
                  <UIFramework.Divider />
                  <UIFramework.Text text="绑定微信帐号可以微信扫一扫登录" />
                </UIFramework.Upload>
              </UIFramework.Row>
              <UIFramework.Row name="姓名" hint="更换姓名">
                <UIFramework.TextInput
                  flex={1} 
                  bindStateCtx={this}
                  bindStateName="form.nickname"
                  value={this.state.form.nickname}
                />
              </UIFramework.Row>
              <UIFramework.Row name="手机号码" hint="修改手机号码需要重新验证手机号">
                <UIFramework.TextInput
                  flex={0.8}
                  bindStateCtx={this}
                  bindStateName="form.phone"
                  value={this.state.form.phone}
                />
                <UIFramework.Button flex={0.2} text="获取验证码" />
              </UIFramework.Row>
              <UIFramework.Row>
                <UIFramework.TextInput
                  bindStateCtx={this}
                  bindStateName="form.smscode"
                  placeholder="输入验证码"
                />
              </UIFramework.Row>
              <UIFramework.Row name="微信帐号" hint="绑定微信帐号可以微信扫一扫登录">
                <UIFramework.TextInput />
              </UIFramework.Row>
              <UIFramework.Row name="邮箱">
                <UIFramework.TextInput 
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
