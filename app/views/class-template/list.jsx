"use strict";

import React from 'react';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import { DropModal } from 'boron';
import { SearchInput } from '../../components/toolbar/components/search';
import { client } from '../../api';
import moment from 'moment';

moment.locale('zh-cn');

class List extends React.Component {
  constructor(props) {
    super(props);
  }
  get title() {
    return '课程模版';
  }
  get actions() {
    return [
      {
        title: '新的课程模版',
        path: '/class/template/add'
      }
    ];
  }
  get config() {
    return {
      title: 'name',
      section: (item) => {
        return [
          <div key={0}>时长1小时</div>,
          <div key={1}>{item.trainer.fullname.first}</div>
        ];
      },
      detail: {
        component: Detail
      }
    }
  }
  async source() {
    let venue = await client.org.getSelectedVenue();
    return await client.classTemplate.list({
      where: {
        venueId: venue.id
      },
      include: ['venue', 'trainer']
    });
  }
  render() {
    return (
      <MasterDetail 
        pathname="class/template"
        className="class-template"
        masterSource={this.source}
        masterConfig={this.config}
      />
    );
  }
}

module.exports = List;
