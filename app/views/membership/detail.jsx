"use strict";

import React from 'react';
import moment from 'moment';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import './detail.css';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let item = this.props.data;
    console.log(item);
    return (
      <div className="membership-detail-container">
        <div className="package-card">
          <div className="package-card-row">
            <div className="package-card-head">名称</div>
            <div className="package-card-column">{item.package.name}</div>
          </div>
          <div className="package-card-row">
            <div className="package-card-head">分类</div>
            <div className="package-card-column">{item.package.category}</div>
          </div>
          <div className="package-card-row">
            <div className="package-card-head">过期时间</div>
            <div className="package-card-column">
              {moment(item.package.expiredAt).format('YYYY-MM-DD')}
            </div>
          </div>
          <div className="package-card-row">
            <div className="package-card-head">开卡时间</div>
            <div className="package-card-column">
              {moment(item.createdAt).format('YYYY-MM-DD')}
            </div>
          </div>
          <div className="package-card-avatar">
            <img src={item.user.avatar.uri} />
            {item.user.nickname}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;
