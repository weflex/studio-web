"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import {
  UIForm,
  UIRow,
  UIDateInput,
  UITextInput,
  UIButton,
  UIOptionPicker,
} from '../../components/ui-form';
import { client } from '../../api';
import './add.css';

class AddMembershipView extends React.Component {
  constructor(props) {
    super(props);
    this.cachedPackages = {};
    this.state = {
      form: {
        correction: {},
        lifetime: {},
      },
      packageOptions: [
        {text: '未选择'}
      ],
      selected: null
    };
  }
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const packages = await client.classPackage.list({
      where: {
        venueId: venue.id,
      }
    });
    this.cachedPackages = _.keyBy(packages, 'id');
    this.setState({
      packageOptions: packages.map((item) => {
        return {
          text: item.name,
          value: item.id,
        };
      }),
    });
  }
  async onSubmit() {
    try {
      const res = await client.middleware('/transaction/add-user', {
        nickname: this.state.form.nickname,
        phone: this.state.form.phone,
        packageId: this.state.form.packageId,
        createdAt: this.state.form.createdAt,
        correction: this.state.form.correction,
      }, 'post');
      if (!res || !res.user || !res.membership) {
        throw new Error('Internal Server Error');
      }
      // FIXME(Yorkie): When props doesn't have `user`, we should
      // notify user if this user is not a new addition.
      if (!this.props.user && !res.user.isNew) {
        alert(`您添加了一个已存在的会员：${res.user.nickname}`);
      }
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (err) {
      console.error(err);
      alert(err && err.message);
    }
  }
  get submitDisabled() {
    return !(this.state.form.nickname &&
      this.state.form.phone &&
      this.state.form.phone.length === 11 &&
      this.state.form.createdAt);
  }
  onChangePackage(event) {
    this.setState({
      selected: event.target.value,
    });
  }
  render() {
    let currentPackage = this.cachedPackages[this.state.selected];
    let correction = {
      name: null,
      hint: null,
      view: null,
    }
    if (currentPackage) {
      if (currentPackage.accessType === 'unlimited') {
        correction.name = '修正有效期';
        correction.hint = currentPackage.name + '是不限次卡，可以修正有效期';
        correction.view = [
          <UIOptionPicker
            key="lifetime-op" flex={0.2} options={[
              {text: '加', value: 'plus'},
              {text: '减', value: 'minus'},
            ]}
          />,
          <UITextInput
            key="lifetime-value"
            flex={0.6}
            bindStateCtx={this}
            bindStateName="form.lifetime.value"
            defaultValue={0}
          />,
          <UIOptionPicker
            key="lifetime-scale" flex={0.2} disabled={true} options={[
              {text: '天', value: 'day'},
            ]}
          />
        ];
      } else {
        correction.name = '修正可用次数';
        correction.hint = currentPackage.name + '是次卡，可以修正可用次数';
        correction.view = [
          <UIOptionPicker
            key="passes-op" 
            flex={0.2} 
            bindStateCtx={this}
            bindStateType={Boolean}
            bindStateName="form.correction.positive"
            options={[
              {text: '加', value: 1},
              {text: '减', value: 0},
            ]}
          />,
          <UITextInput
            key="passes"
            flex={0.6}
            bindStateCtx={this}
            bindStateType={Number}
            bindStateName="form.correction.value"
            defaultValue={0}
          />,
          <UIOptionPicker
            key="passes-unit" flex={0.2} disabled={true} options={[
              {text: '次'}
            ]}
          />
        ];
      }
    }

    return (
      <UIForm className="membership-add">
        <UIRow name="用户姓名" hint="用户的名字">
          <UITextInput
            bindStateCtx={this}
            bindStateName="form.nickname"
            value={this.props.user && this.props.user.nickname}
          />
        </UIRow>
        <UIRow name="手机号码" hint="用户的手机号码">
          <UITextInput
            bindStateCtx={this}
            bindStateName="form.phone"
            value={this.props.user && this.props.user.phone}
          />
        </UIRow>
        <UIRow name="会卡" hint="用户需要会卡才能预定课程">
          <UIOptionPicker
            flex={0.6}
            bindStateCtx={this}
            bindStateName="form.packageId"
            options={this.state.packageOptions}
            onChange={this.onChangePackage.bind(this)}
          />
          <UIDateInput
            flex={0.4}
            bindStateCtx={this}
            bindStateName="form.createdAt"
          />
        </UIRow>
        <UIRow name={correction.name} hint={correction.hint}>
          {correction.view}
        </UIRow>
        <UIRow>
          <UIButton text="创建用户" 
            onClick={this.onSubmit.bind(this)} 
            disabled={this.submitDisabled} 
          />
        </UIRow>
      </UIForm>
    );
  }
}

module.exports = AddMembershipView;
