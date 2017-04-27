'use strict';

import {keyBy, intersectionBy} from 'lodash';
import moment from 'moment';
import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../api';

export default class extends React.Component {
  static propTypes = {
    member      : React.PropTypes.object,
    data        : React.PropTypes.object,
    onComplete  : React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.cachedPackages = {};
    this.state = {
      form: Object.assign({
        correction: {},
        lifetime: {},
      }, props.data),
      packageOptions: [],
      salesOptions: [],
      selected: null,
    };
  }

  async componentWillMount() {
    let {form} = this.state;

    const venue = await client.user.getVenueById();

    const packages = await client.classPackage.list({
      where: {
        venueId: venue.id,
      }
    });
    this.cachedPackages = keyBy(packages, 'id');
    const curr = this.cachedPackages[form.packageId];
    if (curr && curr.price) {
      form.price = curr.price;
    }
    const packageOptions = packages.map((item) => {
      return {
        text: item.name,
        value: item.id,
        data: item,
      };
    });

    const trainers = await client.collaborator.list({
      where: {
        venueId: venue.id,
      }
    });
    const salesOptions = trainers.map((item) => {
      return {
        text  : item.fullname.first + item.fullname.last,
        value : item.id,
        data  : item,
      };
    });
    salesOptions.unshift({ text: "（空）", value: null, data: null});

    this.setState({
      form,
      packageOptions,
      salesOptions,
    });
  }

  onChangePackage(event) {
    let {form} = this.state;
    const curr = this.cachedPackages[form.packageId];
    form.price = curr.price;
    this.forceUpdate();
  }

  async onSubmit() {
    let salesId = (this.state.form.salesId === "（空）") ? null : this.state.form.salesId;
    const membership = {
      price: this.state.form.price,
      packageId: this.state.form.packageId,
      memberId: this.props.member.id,
      correction: this.state.form.correction,
      startsAt: this.state.form.startsAt,
      salesId,
    };

    if (this.props.data) {
      await client.membership.update(
        this.props.data.id, membership, this.props.data.modifiedAt);
    } else {
      await client.membership.create(membership);
    }
    if (typeof this.props.onComplete === 'function') {
      await this.props.onComplete();
    }
  }

  onDelete() {
    let props = this.props;
    UIFramework.Modal.confirm({
      title: '确认删除会卡信息？',
      content: `您正在删除会员 ${this.props.member.nickname} 的会卡，删除后将无法返回`,
      onOk: async () => {
        try {
          await client.membership.delete(props.data.id, props.data.modifiedAt);
          if (typeof props.onComplete === 'function') {
            props.onComplete();
          }
        } catch (err) {
          if (err.code === 'RESOURCE_EXPIRED') {
          } else {
            UIFramework.Message.error('我们遇到了一个错误');
            console.error(err);
          }
        }
      }
    })
  }

  render() {
    let currentPackage = this.cachedPackages[this.state.form.packageId];
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
            bindStateCtx={this}
            bindStateName="form.correction.positive"
            bindStateType={Boolean}
            value={this.state.form.correction.positive}
            key="lifetime-op" flex={0.2} options={[
              {text: '加', value: true},
              {text: '减', value: false},
            ]}
          />,
          <UIFramework.TextInput
            key="lifetime-value"
            flex={0.6}
            bindStateCtx={this}
            bindStateType={Number}
            bindStateName="form.correction.value"
            value={this.state.form.correction.value}
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
            bindStateName="form.correction.positive"
            bindStateType={Boolean}
            value={this.state.form.correction.positive}
            options={[
              {text: '加', value: true},
              {text: '减', value: false},
            ]}
          />,
          <UIFramework.TextInput
            key="passes"
            flex={0.6}
            bindStateCtx={this}
            bindStateType={Number}
            bindStateName="form.correction.value"
            value={this.state.form.correction.value}
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
          {(() => {
            if (!this.state.packageOptions.length) {
              return (
                <UIFramework.Select
                  flex={0.5}
                  options={[
                    {text: '未选择'}
                  ]}
                />
              );
            } else {
              return (
                <UIFramework.Select
                  flex={0.5}
                  bindStateCtx={this}
                  bindStateName="form.packageId"
                  value={this.state.form.packageId}
                  options={this.state.packageOptions}
                  onChange={this.onChangePackage.bind(this)}
                />
              );
            }
          })()}
          <UIFramework.DateInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.startsAt"
            value={moment(this.state.form.startsAt).format('YYYY-MM-DD')}
          />
        </UIFramework.Row>
        <UIFramework.Row name="实付价格">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.price"
            bindStateType={Number}
            value={this.state.form.price}
          />
        </UIFramework.Row>
        <UIFramework.Row name="销售人">
          <UIFramework.Select
            flex={1}
            bindStateCtx={this}
            bindStateName="form.salesId"
            value={this.state.form.salesId}
            options={this.state.salesOptions}
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
                disabled={!this.state.form.startsAt}
              />
            );
            return btns

          })()}
        </UIFramework.Row>
      </UIFramework>
    );
  }
}
