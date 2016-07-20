"use strict";

import moment from 'moment';
import React from 'react';
import UIIdentificationCard from 'react-identification-card';
import './index.css';

export default class UIMembershipCard extends React.Component {
  static styles = {
    container: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      color: '#ffffff',
      fontSize: '1em',
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
        marginRight: '15px',
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
    const wrapper = (children) => {
      return (
        <div style={UIMembershipCard.styles.container}>
          <ul style={UIMembershipCard.styles.basic}>
            <li>
              <header style={UIMembershipCard.styles.basicName}>会卡名称</header>
              <section style={UIMembershipCard.styles.basicValue}>
                {this.props.data.name}
              </section>
            </li>
            {children}
          </ul>
          <div style={UIMembershipCard.styles.price}>
            <div style={UIMembershipCard.styles.priceValue}>{this.props.data.price}</div>
            <div style={UIMembershipCard.styles.priceUnit}>CNY</div>
          </div>
        </div>
      );
    };

    const { lifetime } = this.props.data;

    if (this.props.type === 'membership') {
      let correctVal = 0;
      if (this.props.data.correction) {
        const { positive, value } = this.props.data.correction;
        if (isFinite(value)) {
          correctVal = positive ? value : -value;
        } else {
          correctVal = 0;
        } 
      }
      if (this.props.data.accessType === 'multiple') {
        return wrapper([
          <li key="multiple-passes">
            <header style={UIMembershipCard.styles.basicName}>有效次数</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {this.props.data.passes + correctVal}次
            </section>
          </li>,
          <li key="multiple-expires">
            <header style={UIMembershipCard.styles.basicName}>到期时间</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {moment(this.props.data.createdAt).add(lifetime.value, lifetime.scale).format('YYYY-MM-DD')}
            </section>
          </li>
        ]);
      } else {
        return wrapper([
          <li key="unlimited-start-time">
            <header style={UIMembershipCard.styles.basicName}>开卡时间</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {moment(this.props.data.createdAt).format('YYYY-MM-DD')}
            </section>
          </li>,
          <li key="unlimited-end-time">
            <header style={UIMembershipCard.styles.basicName}>到期时间</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {moment(this.props.data.createdAt).add(lifetime.value + correctVal, lifetime.scale).format('YYYY-MM-DD')}
            </section>
          </li>
        ]);
      }
    } else {
      let lifetimeString = (lifetime) => {
        switch (lifetime.scale) {
          case 'day'  : return `${lifetime.value}天`;
          case 'month': return `${lifetime.value}个月`;
          case 'year' : return `${lifetime.value}年`;
          default     : return '';
        }
      }
      if (this.props.data.accessType === 'multiple') {
        return wrapper([
          <li key="multiple-passes">
            <header style={UIMembershipCard.styles.basicName}>有效次数</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {this.props.data.passes}次
            </section>
          </li>,
          <li key="multiple-expires">
            <header style={UIMembershipCard.styles.basicName}>有效时间</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {lifetimeString(lifetime)}
            </section>
          </li>
        ]);
      } else {
        return wrapper([
          <li key="unlimited-start-time">
            <header style={UIMembershipCard.styles.basicName}>有效次数</header>
            <section style={UIMembershipCard.styles.basicValue}>
              不限次
            </section>
          </li>,
          <li key="unlimited-end-time">
            <header style={UIMembershipCard.styles.basicName}>有效时间</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {lifetimeString(lifetime)}
            </section>
          </li>
        ]);
      }
    }
  }
}
