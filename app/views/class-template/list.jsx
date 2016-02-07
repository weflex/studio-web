"use strict";

import React from 'react';
import MasterDetail from '../../components/master-detail';
import ListView from '../../components/list-view';
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

class ClassTemplateList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rows = [
      {
        title: '课程名',
        sortBy: o => o.name,
        display: o => o.name
      },
      {
        title: '课程定价',
        sortBy: o => o.price,
        display: o => o.price
      },
      {
        title: '工作室',
        sortBy: o => o.venue.name,
        display: o => o.venue.name
      },
      {
        title: '教练',
        sortBy: o => o.trainer.fullname.first,
        display: o => o.trainer.fullname.first
      }
    ];
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
  renderView(data) {
    return (
      <div className="list-view">
        <div className="list-view-header">课程信息</div>
        <div className="list-view-content">
          <div className="list-view-fieldset">
            <label>课程名</label>
            <span>{data.name}</span>
          </div>
          <div className="list-view-fieldset">
            <label>课程定价</label>
            <span>{data.price}</span>
          </div>
          <div className="list-view-fieldset">
            <label>所属工作室</label>
            <span>{data.venue.name}</span>
          </div>
          <div className="list-view-fieldset">
            <label>工作室地址</label>
            <span>{data.venue.address}</span>
          </div>
          <div className="list-view-fieldset">
            <label>工作室联系电话</label>
            <span>{data.venue.phone}</span>
          </div>
          <div className="list-view-fieldset">
            <label>教练姓名</label>
            <span>
              {data.trainer.fullname.last} {data.trainer.fullname.first}
            </span>
          </div>
        </div>
        <div className="list-view-footer">
        </div>
      </div>
    );
  }
  render() {
    return (
      <div>
        <ListView
          loadingHint="正在加载课程模版资源"
          dataSource={async () => {
            let venue = await client.org.getSelectedVenue();
            return await client.classTemplate.list({
              where: {
                venueId: venue.id
              },
              include: ['venue', 'trainer']
            });
          }}
          renderView={this.renderView}
          rows={this.rows} 
        />
      </div>
    );
  }
}

module.exports = List;
