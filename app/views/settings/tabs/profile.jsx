"use strict"

import React from 'react';
import {
  UIForm,
  UIRow,
  UITextInput,
  UIFileInput,
  UIButton,
  UILabel,
  UIText,
  UIOptionPicker
} from 'react-ui-form';
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
            <UIForm>
              <UIRow name="姓名">
                <UITextInput 
                  bindStateCtx={this}
                  bindStateName="form.nickname"
                  value={this.state.form.nickname}
                />
              </UIRow>
              <UIRow name="手机号码" hint="修改手机号码需要重新验证手机号">
                <UITextInput
                  flex={0.8}
                  bindStateCtx={this}
                  bindStateName="form.phone"
                  value={this.state.form.phone}
                />
                <UIButton flex={0.2} text="获取验证码" />
              </UIRow>
              <UIRow>
                <UITextInput
                  bindStateCtx={this}
                  bindStateName="form.smscode"
                  placeholder="输入验证码"
                />
              </UIRow>
              <UIRow name="微信帐号" hint="绑定微信帐号可以微信扫一扫登录">
                <UITextInput />
              </UIRow>
              <UIRow name="邮箱">
                <UITextInput 
                  bindStateCtx={this} 
                  bindStateName="form.email" 
                  value={this.state.form.email}
                />
              </UIRow>
            </UIForm>
          </div>
        </div>
        <div className="detail-cards-right">
          <div className="detail-card">
            <h3>个人信息完善度</h3>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Profile;
