"use strict";

/**
 * @module ui-history
 */

import React from 'react';
import moment from 'moment';
const DEFAULT_COLOR = '#d8d8d8';


/**
 * @class UIHistory
 */
class UIHistory extends React.Component {
  static propTypes = {
    /**
     * @property {Array} data - the logs to render
     */
    data: React.PropTypes.array,
    /**
     * @property {Array} colors - the category definition
     */
    colors: React.PropTypes.object,
    /**
     * @property {Function} description - build the description string
     * @required
     */
    description: React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    colors: {},
  };
  static styles = {
    empty: {
      fontSize: '14px',
    },
    list: {
      marginLeft: '10px',
      borderLeft: '2px solid #e8e8e8',
      height: '100%',
    },
    item: {
      margin: '10px 0 10px -10px',
    },
    itemSpan: {
      display: 'inline-block',
      lineHeight: '20px',
      verticalAlign: 'middle',
      fontSize: '12px',
      boxSizing: 'content-box',
    },
    itemDot: {
      height: '12px',
      width: '12px',
      border: '4px solid #efefef',
      borderRadius: '10px',
      marginRight: '10px',
    },
    itemDateTime: {
      color: '#828282',
      width: '90px',
    },
    itemDescription: {
      color: '#4a4a4a',
      padding: '0 4px',
      display: 'block',
      marginLeft: '26px',
    }
  };
  componentWillMount() {
    moment.locale('zh-CN');
  }
  wrap(children) {
    return (
      <div className={this.props.className}>
        {children}
      </div>
    );
  }
  render() {
    if (!this.props.data || !this.props.data.length) {
      return this.wrap(
        <div style={UIHistory.styles.empty}>无历史记录</div>
      );
    }
    return this.wrap(
      <ul style={UIHistory.styles.list}>
        {this.props.data.map((item, key) => {
          const date = moment(item.createdAt);
          const dotStyle = {
            backgroundColor: this.props.colors[item.status] || DEFAULT_COLOR,
          };
          return (
            <li key={key} style={UIHistory.styles.item}>
              <span style={Object.assign(dotStyle, UIHistory.styles.itemSpan, UIHistory.styles.itemDot)}></span>
              <span style={Object.assign({}, UIHistory.styles.itemSpan, UIHistory.styles.itemDateTime)}>
                {date.format('MM[月]DD[日]')} {date.format('HH:mm')}
              </span>
              <span style={Object.assign({}, UIHistory.styles.itemSpan, UIHistory.styles.itemDescription)}>
                {this.props.description(item)}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
}

module.exports = {
  UIHistory,
};
