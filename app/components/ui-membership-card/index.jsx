"use strict";

import './index.css';
import React from 'react';
import UIIdentificationCard from 'react-identification-card';
import { format } from 'date-fns';

export default class UIMembershipCard extends React.Component {
  static propTypes = {
    type      : React.PropTypes.string,
    className : React.PropTypes.string,
    width     : React.PropTypes.number,
    data      : React.PropTypes.object,
    onClick   : React.PropTypes.func,
  };

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
      lineHeight: '25px',
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
  };

  constructor(props) {
    super(props);
    this.contents = this.contents.bind(this);
  }

  getStringLifetime(lifetime) {
    const timeUnit = {
      'day': '天',
      'month': '月',
      'year': '年',
    };

    return lifetime.value + timeUnit[lifetime.scale];
  }

  contents() {
    const { type, lifetime, name, accessType, available, passes, startsAt, expiresAt, price } = this.props.data;

    const wrapper = (children) => {
      return (
        <div style={UIMembershipCard.styles.container}>
          <ul style={UIMembershipCard.styles.basic}>
            <li>
              <header style={UIMembershipCard.styles.basicName}>会卡名称</header>
              <section style={UIMembershipCard.styles.basicValue}>
                { name }
              </section>
            </li>
            { children }
          </ul>
          <div style={UIMembershipCard.styles.price}>
            <div style={UIMembershipCard.styles.priceValue}>{ price }</div>
            <div style={UIMembershipCard.styles.priceUnit}>CNY</div>
          </div>
        </div>
      );
    };

    if(type === 'package') {
      return wrapper([
        <li key="multiple-available">
          <header style={UIMembershipCard.styles.basicName}>有效次数</header>
          <section style={UIMembershipCard.styles.basicValue}>
            {(accessType === 'multiple')? passes: '不限'}次
          </section>
        </li>,
        <li key="unlimited-startsAt">
          <header style={UIMembershipCard.styles.basicName}>有效时间</header>
          <section style={UIMembershipCard.styles.basicValue}>
            {this.getStringLifetime(lifetime)}
          </section>
        </li>
      ]);
    } else {
      if (accessType === 'multiple') {
        return wrapper([
          <li key="multiple-available">
            <header style={UIMembershipCard.styles.basicName}>剩余次数</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {available}次
            </section>
          </li>,
          <li key="unlimited-startsAt">
            <header style={UIMembershipCard.styles.basicName}>生效日期</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {format(startsAt, 'YYYY-MM-DD')}
            </section>
          </li>,
          <li key="multiple-expiresAt">
            <header style={UIMembershipCard.styles.basicName}>到期日期</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {format(expiresAt, 'YYYY-MM-DD')}
            </section>
          </li>
        ]);
      } else {
        return wrapper([
          <li key="unlimited-startsAt">
            <header style={UIMembershipCard.styles.basicName}>生效日期</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {format(startsAt, 'YYYY-MM-DD')}
            </section>
          </li>,
          <li key="unlimited-expiresAt">
            <header style={UIMembershipCard.styles.basicName}>到期日期</header>
            <section style={UIMembershipCard.styles.basicValue}>
              {format(expiresAt, 'YYYY-MM-DD')}
            </section>
          </li>
        ]);
      }
    }
  }

  render() {
    const { className, width, data, onClick } = this.props;
    return (
      <UIIdentificationCard
        className={className}
        width={width || 236}
        viewMetadata={this.contents}
        color={data && data.color}
        isEmpty={!!data}
        onClick={onClick}
      />
    );
  }

}
