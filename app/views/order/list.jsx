"use strict";

import moment from 'moment';
import React from 'react';
import ListView from '../../components/list-view';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import AddOrderView from './add';
import { DropModal } from 'boron2';
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
        onClick: this.onViewAddOrder.bind(this)
      }
    ];
  }
  get config() {
    return {
      title: 'title',
      master: (item, index) => {
        return (
          <div className="order-item">
            <div className="order-user">
              <img src={item.user.avatar.uri} />
              <span>{item.user.nickname}</span>
            </div>
            <div className="order-simple-info">
              <header>{item.class.template.name}</header>
              <section>
                <div className="order-class-duration">
                  {moment(item.class.date).format('MM[月]DD[日]')}
                </div>
                <div className="order-num">
                  订单号: {item.passcode}
                </div>
              </section>
            </div>
          </div>
        )
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
          'user': ['avatar']
        },
        {
          'class': ['template', 'trainer']
        },
      ],
    });
    return (list || []).map((item) => {
      item.title = item.class.template.name;
      return item;
    });
  }
  onViewAddOrder() {
    this.refs.addOrderModal.show();
  }
  async onCompleteAddOrder() {
    this.refs.addOrderModal.hide();
    await this.refs.masterDetail.updateMasterSource();
  }
  render() {
    return (
      <div style={{height: '100%'}}>
        <MasterDetail 
          ref="masterDetail"
          pathname="order"
          className="order"
          masterSource={this.source}
          masterConfig={this.config}
        />
        <DropModal ref="addOrderModal">
          <AddOrderView 
            onComplete={this.onCompleteAddOrder.bind(this)}
          />
        </DropModal>
      </div>
    );
  }
}

module.exports = List;
