"use strict";

import _ from 'lodash';
import React from 'react';
import { client } from '../../api';
import { ClipLoader } from 'halogen';
import UIFramework from '@weflex/weflex-ui';
import UIMembershipCard from '../../components/ui-membership-card';
import './list.css';

class ClassPackageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sortKey: 'accessType',
      data: [],
    };
  }
  get title() {
    return '我的会员卡';
  }
  get actions() {
    return [
      {
        title: '新增会卡',
        path: '/class/package/add',
      }
    ];
  }
  async componentDidMount() {
    let self = this;
    self.refresh();
  }
  componentWillUnmount() {
  }
  async refresh() {
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
  onClickAddCard() {
    this.props.app.router.navigate(window.location.pathname + '/add');
  }
  onClickCard(data) {
    this.props.app.router.navigate(window.location.pathname + '/' + data.id, data);
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

    const data = _.groupBy(this.state.data, (item) => {
      let key;
      switch (item.accessType) {
        case 'unlimited': key = '不限次卡'; break;
        case 'multiple':
          switch (item.category) {
            case 'group': key = '团课次卡'; break;
            case 'private': key = '私教次卡'; break;
            default: key = '次卡'; break;
          }
          break;
        case 'cashCard': key='储值卡';break;
        default:
          key = '未归类';
      }
      return key;
    });

    return Object.keys(data).map((name) => {
      return (
        <div className="class-package-grid grid" key={name}>
          <fieldset className="grid-title">
            <legend>
              <span>{name}</span>
              <span className="grid-title-total">{data[name].length}</span>
            </legend>
          </fieldset>
          <div className="grid-items">
            {data[name].map((data, key) => {
              return (
                <UIMembershipCard 
                  className="grid-item" 
                  data={ Object.assign(data, {type: 'package'}) } 
                  key={key}
                  onClick={this.onClickCard.bind(this, data)}
                />
              );
            })}
            <UIMembershipCard className="grid-item" onClick={this.onClickAddCard.bind(this)} />
          </div>
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
        <div className="class-package-grids">
          {this.renderGrid()}
        </div>
      </div>
    );
  }
}

module.exports = ClassPackageList;
