"use strict";

import moment from 'moment';
import React from 'react';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import AddOrderView from './add';
import UIFramework from 'weflex-ui';
import { UIProfileListItem } from '../../components/ui-profile';
import { client } from '../../api';
import './list.css';
moment.locale('zh-cn');

class List extends React.Component {
  get title() {
    return '订单管理';
  }
  get actions() {
    return [
      {
        title: '创建订单',
        onClick: this.onViewAddOrder.bind(this),
        disableToggled: true,
      }
    ];
  }
  get config() {
    return {
      title: 'title',
      master: (item, index) => {
        return (
          <UIProfileListItem avatar={item.user.avatar}
            header={item.class.template.name}
            labelText={item.user.nickname}>
            <div className="order-class-duration">
              {moment(item.class.date).format('MM[月]DD[日]')}
            </div>
            <div className="order-num">
              订单号: {item.passcode}
            </div>
          </UIProfileListItem>
        );
      },
      detail: {
        component: Detail
      },
      iterated: true,
      sortKeys: [
        {name: '订单时间', key: 'createdAt'},
        {name: '课程时间', key: 'class.date'},
        {name: '用户', key: 'user.nickname'},
      ],
      onClickAdd: this.onViewAddOrder.bind(this),
      addButtonText: '添加新订单',
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      modalVisibled: false,
    };
  }
  async source() {
    const venue = await client.user.getVenueById();
    const templates = await client.classTemplate.list({
      where: {
        venueId: venue.id
      },
      include: ['classes']
    });
    const classIds = templates.reduce((ids, template) => {
      (template.classes || []).forEach(item => ids.push(item.id));
      return ids;
    }, []);
    const list = await client.order.list({
      where: {
        classId: {
          inq: classIds,
        }
      },
      include: [
        'history',
        {
          'payments': ['membership', 'order']
        },
        {
          'user': ['avatar']
        },
        {
          'class': ['template', 'trainer']
        },
      ],
    });
    return (list || []).filter((item) => {
      return item.class;
    }).map((item) => {
      item.title = item.class.template.name;
      return item;
    });
  }
  onViewAddOrder() {
    this.setState({
      modalVisibled: true,
    });
  }
  async onCompleteAddOrder() {
    this.setState({
      modalVisibled: false,
    });
    await this.refs.masterDetail.updateMasterSource();
  }
  onRefDetail(instance) {
    if (instance) {
      if (instance.title) {
        this.props.app.title(instance.title);
      }
      if (instance.actions) {
        this.props.app.actions(instance.actions);
      }
    }
  }
  async componentDidMount() {
    client.bindChangeProxy('Order', null, (data) => {
      this.refs.masterDetail.updateMasterSource();
      UIFramework.Message.success('已更新课程模版');
    });
  }
  render() {
    return (
      <div style={{height: '100%'}}>
        <MasterDetail 
          ref="masterDetail"
          pathname="order"
          className="order"
          refDetail={this.onRefDetail.bind(this)}
          masterSource={this.source}
          masterConfig={this.config}
        />
        <UIFramework.Modal
          title="添加新订单"
          footer=""
          visible={this.state.modalVisibled}
          onCancel={() => this.setState({modalVisibled: false})}>
          <AddOrderView 
            onComplete={this.onCompleteAddOrder.bind(this)}
          />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = List;
