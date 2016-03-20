"use strict";

import React from 'react';
import { UIIdentificationCard } from '../ui-identification-card';
import './index.css';

class UIMembershipCard extends React.Component {
  static styles = {
    container: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 100,
    },
    basic: {
      position: 'absolute',
      bottom: 0,
    },
    basicItem: {
      display: 'inline-block',
      lineHeight: '30px',
    },
    get basicName() {
      return Object.assign({
        marginRight: '20px',
        fontWeight: 'normal',
      }, this.basicItem);
    },
    get basicValue() {
      return Object.assign({
        // TO BE ADDED
      }, this.basicItem);
    },
    price: {
      position: 'absolute',
      right: 0,
      bottom: 0,
    },
    priceValue: {
      fontSize: '24px',
      fontWeight: 'normal',
    },
  };

  render() {
    return (
      <UIIdentificationCard
        className={this.props.className}
        width={this.props.width || 236}
        viewMetadata={this.contents.bind(this)}
        color={this.props.data && this.props.data.color}
        isEmpty={!!this.props.data}
        onClick={this.props.onClick}
      />
    );
  }

  contents() {
    return (
      <div style={UIMembershipCard.styles.container}>
        <ul style={UIMembershipCard.styles.basic}>
          <li>
            <header style={UIMembershipCard.styles.basicName}>会卡名称</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {this.props.data.name}
            </section>
          </li>
          <li>
            <header style={UIMembershipCard.styles.basicName}>有效次数</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {this.props.data.passes}次
            </section>
          </li>
          <li>
            <header style={UIMembershipCard.styles.basicName}>有效时间</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {this.props.data.lifetime && this.props.data.lifetime.value}
              {((lifetime) => {
                switch (lifetime.scale) {
                  case 'day'  : return '天';
                  case 'month': return '个月';
                  case 'year' : return '年';
                }
              })(this.props.data.lifetime || {})}
            </section>
          </li>
        </ul>
        <div style={UIMembershipCard.styles.price}>
          <div style={UIMembershipCard.styles.priceValue}>{this.props.data.price}</div>
          <div style={UIMembershipCard.styles.priceUnit}>CNY</div>
        </div>
      </div>
    );
  }
}

module.exports = {
  UIMembershipCard,
};