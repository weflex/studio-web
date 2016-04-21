'use strict';

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../api';

export default class extends React.Component {
  static propTypes = {
    member: React.PropTypes.object,
    data: React.PropTypes.object,
    onComplete: React.PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.cachedPackages = {};
    this.state = {
      form: Object.assign({
        correction: {},
        lifetime: {},
      }, props.data),
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
  onChangePackage(event) {
    this.setState({
      selected: event.target.value,
    });
  }
  async onSubmit() {
    const membership = {
      packageId: this.state.form.packageId,
      memberId: this.props.member.id,
      correction: this.state.form.correction,
      createdAt: this.state.form.createdAt,
    };
    if (this.props.data) {
      await client.membership.update(
        this.props.data.id, membership);
    } else {
      await client.membership.create(membership);
    }
    if (typeof this.props.onComplete === 'function') {
      this.props.onComplete();
    }
  }
  onDelete() {
    let props = this.props;
    UIFramework.Modal.confirm({
      title: '确认删除会卡信息？',
      content: `您正在删除会员 ${this.props.member.nickname} 的会卡，删除后将无法返回`,
      onOk: async () => {
        await client.membership.delete(props.data.id);
        if (typeof props.onComplete === 'function') {
          props.onComplete();
        }
      }
    })
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
          <UIFramework.Select
            key="lifetime-op" flex={0.2} options={[
              {text: '加', value: 'plus'},
              {text: '减', value: 'minus'},
            ]}
          />,
          <UIFramework.TextInput
            key="lifetime-value"
            flex={0.6}
            bindStateCtx={this}
            bindStateName="form.lifetime.value"
            defaultValue={0}
          />,
          <UIFramework.Select
            key="lifetime-scale" flex={0.2} disabled={true} options={[
              {text: '天', value: 'day'},
            ]}
          />
        ];
      } else {
        correction.name = '修正可用次数';
        correction.hint = currentPackage.name + '是次卡，可以修正可用次数';
        correction.view = [
          <UIFramework.Select
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
          <UIFramework.TextInput
            key="passes"
            flex={0.6}
            bindStateCtx={this}
            bindStateType={Number}
            bindStateName="form.correction.value"
            defaultValue={0}
          />,
          <UIFramework.Select
            key="passes-unit" flex={0.2} disabled={true} options={[
              {text: '次'}
            ]}
          />
        ];
      }
    }

    return (
      <UIFramework>
        <UIFramework.Row name="会员姓名">
          <UIFramework.TextInput 
            flex={1} value={this.props.member.nickname} disabled />
        </UIFramework.Row>
        <UIFramework.Row name="会卡" hint="会员需要会卡才能预定课程">
          <UIFramework.Select
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.packageId"
            value={this.state.form.packageId}
            options={this.state.packageOptions}
            onChange={this.onChangePackage.bind(this)}
          />
          <UIFramework.DateInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.createdAt"
            value={moment(this.state.form.createdAt).format('YYYY-MM-DD')}
          />
        </UIFramework.Row>
        <UIFramework.Row name={correction.name} hint={correction.hint}>
          {correction.view}
        </UIFramework.Row>
        <UIFramework.Row>
          {(() => {
            let text;
            let btns = [];
            if (this.props.data) {
              text = '保存会员信息';
              btns.push(
                <UIFramework.Button 
                  key="del"
                  text="删除会卡"
                  onClick={this.onDelete.bind(this)} 
                />
              );
            } else {
              text = '确认添加';
            }
            btns.push(
              <UIFramework.Button 
                key="save"
                text={text}
                onClick={this.onSubmit.bind(this)}
                disabled={!this.state.form.createdAt}
              />
            );
            return btns

          })()}
        </UIFramework.Row>
      </UIFramework>
    );
  }
}