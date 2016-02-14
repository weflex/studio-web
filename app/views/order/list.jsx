"use strict";

import React from 'react';
import ListView from '../../components/list-view';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import moment from 'moment';
import { client } from '../../api';
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
      section: (item) => {
        return [
          <div key={0}>{moment(item.class.date).format('lll')}</div>
        ];
      },
      detail: {
        component: Detail
      }
    };
  }
  async source() {
    let venue = await client.org.getSelectedVenue();
    let list = await client.order.list({
      where: {
        venueId: venue.id
      },
      include: {
        class: 'template'
      }
    });
    console.log(list);
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
