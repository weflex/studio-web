"use strict";

import _ from 'lodash';
import React from 'react';
import { client } from '../../api';
import { ClipLoader } from 'halogen';
import MembershipCard from '../../components/membership-card';
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
        title: '新增会卡',
        path: '/class/package/add'
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
    const sets = _.groupBy(this.state.data, this.state.sortKey);
    return Object.keys(sets).map((name) => {
      return (
        <div className="class-package-grid grid" key={name}>
          <fieldset className="grid-title">
            <legend>
              <span>{name || '默认'}</span>
              <span className="grid-title-total">{sets[name].length}</span>
            </legend>
          </fieldset>
          <div className="grid-items">
            {sets[name].map((data, key) => {
              return (
                <MembershipCard 
                  className="grid-item" 
                  data={data} 
                  key={key}
                  onClick={this.onClickCard.bind(this, data)}
                />
              );
            })}
            <MembershipCard className="grid-item" onClick={this.onClickAddCard.bind(this)} />
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