"use strict";

import React from 'react';
import './index.css';

class MembershipCard extends React.Component {
  constructor(props) {
    super(props);
    const height = 149;
    const width = 236;
    this.defaultColor = '#f0ab51';
    if (this.props.data) {
      this.state = {
        height,
        width,
        color: this.props.data.color || this.defaultColor,
        path: 'M165.845472,0 L227.99565,0 C232.416331,0 236,3.57268443 236,7.99770351 L236,141.002296 C236,145.419306 232.410871,149 227.99565,149 L74.7409935,149 C81.7669784,130.92177 98.4541553,89.6860279 117.435739,54.7599123 C134.773927,22.8576428 154.983589,6.85502733 165.845472,-4.88498131e-15 Z',
        fillColor: '#ffffff',
        fillOpacity: '0.4',
      };
    } else {
      this.state = { height, width };
    }
  }
  onMouseOver() {
    if (this.props.data) {
      this.setState({
        color: '#383838',
        fillOpacity: '0.1'
      });
    }
  }
  onMouseLeave() {
    if (this.props.data) {
      this.setState({
        color: this.props.data.color || this.defaultColor,
        fillOpacity: '0.4'
      });
    }
  }
  renderContent() {
    const viewBox = [0, 0, this.state.width, this.state.height].join(' ');
    return (
      <div className="membership-card-content">
        <svg width={this.state.width} 
          height={this.state.height} 
          viewBox={viewBox} version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(-763.000000, -142.000000)">
            <g transform="translate(150.000000, 52.000000)">
              <g transform="translate(201.000000, 0.000000)">
                <g transform="translate(397.000000, 10.000000)">
                  <g transform="translate(15.000000, 80.000000)">
                    <rect fill={this.state.color} x="0" y="0" rx="8"
                      width={this.state.width} 
                      height={this.state.height}
                    />
                    <path d={this.state.path} 
                      fillOpacity={this.state.fillOpacity} 
                      fill={this.state.fillColor}
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
        <ul className="membership-card-metadata">
          <li>
            <header>会卡名称</header>
            <section>{this.props.data.name}</section>
          </li>
          <li>
            <header>有效次数</header>
            <section>{this.props.data.passes}次</section>
          </li>
          <li>
            <header>有效时间</header>
            <section>
              {this.props.data.lifetime.value}
              {((lifetime) => {
                switch (lifetime.scale) {
                  case 'day': return '天';
                  case 'month': return '个月';
                  case 'year': return '年';
                }
              })(this.props.data.lifetime)}
            </section>
          </li>
        </ul>
        <div className="membership-card-price">
          <div className="membership-card-price-value">{this.props.data.price}</div>
          <div className="membership-card-price-unit">CNY</div>
        </div>
      </div>
    );
  }
  render() {
    let content;
    let style = {
      height: this.state.height,
      width: this.state.width,
    };
    let className = 'membership-card ' + (this.props.className || '');
    if (!this.props.data) {
      style.lineHeight = this.state.height + 'px';
      className += ' membership-card-add';
      content = <div className="membership-card-add-text">点击添加卡片</div>;
    } else {
      content = this.renderContent();
    }
    return (
      <div className={className}
        style={style}
        onClick={this.props.onClick}
        onMouseOver={this.onMouseOver.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}>
        {content}
      </div>
    );
  }
}

module.exports = MembershipCard;