"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import {
  Form,
  Row,
  DateInput,
  TextInput,
  TextButton,
  OptionsPicker,
} from '../../components/form';
import { client } from '../../api';
import './add.css';

class AddMembershipView extends React.Component {
  constructor(props) {
    super(props);
    this.cachedPackages = {};
    this.state = {
      form: {
        correction: {},
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
      await client.middleware('/transaction/add-user', {
        nickname: this.state.form.nickname,
        phone: this.state.form.phone,
        packageId: this.state.form.packageId,
        createdAt: this.state.form.createdAt,
        correction: this.state.form.correction,
      }, 'post');
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
          <OptionsPicker
            key="lifetime-op" flex={0.2} options={[
              {text: '加', value: 'plus'},
              {text: '减', value: 'minus'},
            ]}
          />,
          <TextInput
            key="lifetime-value"
            flex={0.6}
            bindStateCtx={this}
            bindStateName="form.lifetime.value"
            defaultValue={0}
          />,
          <OptionsPicker
            key="lifetime-scale" flex={0.2} disabled={true} options={[
              {text: '天', value: 'day'},
            ]}
          />
        ];
      } else {
        correction.name = '修正可用次数';
        correction.hint = currentPackage.name + '是次卡，可以修正可用次数';
        correction.view = [
          <OptionsPicker
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
          <TextInput
            key="passes"
            flex={0.6}
            bindStateCtx={this}
            bindStateType={Number}
            bindStateName="form.correction.value"
            defaultValue={0}
          />,
          <OptionsPicker
            key="passes-unit" flex={0.2} disabled={true} options={[
              {text: '次'}
            ]}
          />
        ];
      }
    }

    return (
      <Form className="membership-add">
        <Row name="用户姓名" hint="用户的名字">
          <TextInput
            bindStateCtx={this}
            bindStateName="form.nickname"
          />
        </Row>
        <Row name="手机号码" hint="用户的手机号码">
          <TextInput
            bindStateCtx={this}
            bindStateName="form.phone"
          />
        </Row>
        <Row name="会卡" hint="用户需要会卡才能预定课程">
          <OptionsPicker
            flex={0.6}
            bindStateCtx={this}
            bindStateName="form.packageId"
            options={this.state.packageOptions}
            onChange={this.onChangePackage.bind(this)}
          />
          <DateInput
            flex={0.4}
            bindStateCtx={this}
            bindStateName="form.createdAt"
          />
        </Row>
        <Row name={correction.name} hint={correction.hint}>
          {correction.view}
        </Row>
        <Row>
          <TextButton text="创建用户" 
            onClick={this.onSubmit.bind(this)} 
            disabled={this.submitDisabled} 
          />
        </Row>
      </Form>
    );
  }
}

module.exports = AddMembershipView;
