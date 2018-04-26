"use strict";

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import { client } from '../../api';
import moment from 'moment';
moment.locale('zh-cn');

class List extends React.Component {
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
  get search() {
    return this.refs
      .masterDetail
      .onSearchInputChange
      .bind(this.refs.masterDetail);
  }
  get config() {
    let fullname, style
    return {
      title: 'name',
      section: (item) => {
        if (item.trainer) {
          fullname = item.trainer.fullname.first + " " + item.trainer.fullname.last
          style = {}
        } else {
          fullname = "暂无教练，请设置"
          style = {
            color: "#FF8AC2"
          }
        }
        return [
          <div key={0}>{item.duration}分钟</div>,
          <div key={1} style={style}>{fullname}</div>
        ];
      },
      detail: {
        component: Detail
      },
      iterated: true,
      sortKeys: [
        { name: '标题', key: 'name' },
        { name: '教练', key: 'trainer.fullname.first' },
        { name: '价格', key: 'price' },
      ],
      onClickAdd: () => {
        this.props.app.router.navigate('/class/template/add');
      },
      addButtonText: '新的课程模版',
    };
  }
  async source() {
    const venue = await client.user.getVenueById();
    return await client.classTemplate.list({
      where: {
        venueId: venue.id
      },
      include: [
        'venue',
        'cover',
        'photos',
        {
          relation: 'trainer',
          scope: {
            where: {
              trashedAt: {
                exists: false
              }
            }
          }
        }
      ]
    });
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
  constructor(props) {
    super(props);
    this.state = {
      modalVisibled: false,
    };
  }
  async componentDidMount() {
    let self = this;
    let onClassTemplateChange = async (data) => {
      await self.refs.masterDetail.updateMasterSource();
    };
  }
  componentWillUnmount() {
  }
  render() {
    return (
      <MasterDetail
        ref="masterDetail"
        pathname="class/template"
        className="class-template"
        masterSource={this.source}
        masterConfig={this.config}
        refDetail={this.onRefDetail.bind(this)}
        detailProps={{ app: this.props.app }}
      />
    );
  }
}

module.exports = List;
