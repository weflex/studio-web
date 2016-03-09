"use strict";

import React from 'react';
import ListView from '../../components/list-view';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import moment from 'moment';
import { client } from '../../api';
import './list.css';
moment.locale('zh-cn');

class List extends React.Component {
  get title() {
    return '订单管理';
  }
  get actions() {
    return [];
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
      onClickAdd: 'order/add',
      addButtonText: '添加新订单',
    };
  }
  async source() {
    const venue = await client.org.getSelectedVenue();
    const list = await client.order.list({
      where: {
        venueId: venue.id
      },
      include: [
        'user',
        {
          'class': ['template', 'trainer']
        }
      ],
    });
    return (list || []).map((item) => {
      item.title = item.class.template.name;
      return item;
    });
  }
  render() {
    return (
      <MasterDetail 
        pathname="order"
        className="order"
        masterSource={this.source}
        masterConfig={this.config}
      />
    );
  }
}

module.exports = List;
