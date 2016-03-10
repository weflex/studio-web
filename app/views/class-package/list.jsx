"use strict";

import _ from 'lodash';
import React from 'react';
import { client } from '../../api';
import { ClipLoader } from 'halogen';
import './list.css';

class ClassPackageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sortKey: 'tags',
      data: [],
    };
  }
  get title() {
    return '我的会员卡';
  }
  get actions() {
    return [
      {
        title: '添加新卡',
        path: '/class/package/add'
      },
      {
        title: '管理会员卡'
      }
    ];
  }
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const data = await client.classPackage.list({
      where: {
        venueId: venue.id,
      }
    });
    this.setState({
      data,
      loading: false
    });
  }
  renderGrid() {
    if (this.state.loading) {
      return (
        <div className="class-package-loading">
          <ClipLoader color="#242f40" size="14px" />
          <p>正在加载会员卡...</p>
        </div>
      );
    }
    const sets = _.groupBy(this.state.data, this.state.sortKey);
    return Object.keys(sets).map((name) => {
      return (
        <div className="class-package-grid grid" key={name}>
          <div className="grid-title">{name || '默认'}</div>
          <ul className="grid-items">
            {sets[name].map((pkg, index) => {
              return (
                <li key={index} title={pkg.description}>
                  <div className="class-package-name">{pkg.name}</div>
                  <div className="class-package-price">￥{pkg.price}</div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    });
  }
  renderLoading() {
    return (
      <BeatLoader color="#242f40" size="12px" />
    );
  }
  render() {
    return (
      <div className="class-package-container">
        <div className="class-package-actions">
          <select>
            <option>按类型排序</option>
            <option>按名称排序</option>
            <option>按时间排序</option>
          </select>
        </div>
        <div className="class-package-grids">
          {this.renderGrid()}
        </div>
      </div>
    );
  }
}

module.exports = ClassPackageList;