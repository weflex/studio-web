"use strict";

import React from 'react';
import { 
  Location,
  Locations,
  Link
} from 'react-router-component';
import './index.css';

/**
 * MsterDetail
 * props:
 *  masterWidth {Number} specify the width of master
 */

class MasterDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      pathname: this.props.pathname || '',
      masterSource: [],
      detail: null,
      loading: true,
    };
  }
  async componentWillMount() {
    let masterSource = await this.props.masterSource();
    let pathname = this.state.pathname;
    if (!pathname) {
      pathname = window.location.pathname;
    }
    this.setState({
      pathname,
      masterSource,
      loading: false
    });
  }
  getSelected(id) {
    let source = this.state.masterSource;
    let selected = 0;
    for (let index in source) {
      if (source[index].id === id) {
        selected = index;
        break;
      }
    }
    return parseInt(selected);
  }
  render() {
    let className = 'master-detail';
    if (this.props.className) {
      className += (' ' + this.props.className);
    }
    let masterWidth;
    let detailWidth;
    if (this.props.masterWidth) {
      masterWidth = this.props.masterWidth;
      detailWidth = `calc(100% - ${masterWidth + 1}px)`;
    }
    return (
      <div className={className}>
        {this.renderMaster(masterWidth, this.props.hideBorder)}
        <div className="detail" style={{ width: detailWidth }}>
          <Locations contextual>
            <Location path="/" handler={this.renderDetail.bind(this)} />
            <Location path="/:id" handler={this.renderDetail.bind(this)} />
          </Locations>
        </div>
      </div>
    );
  }
  renderMaster(width, hideBorder) {
    let pathname = this.state.pathname;
    const id = window.location.pathname.replace(pathname, '').replace(/\//g, '');
    const selected = this.getSelected(id);
    const config = this.props.masterConfig || {
      title: 'title',
      section: null
    };
    let className = 'master';
    let style;
    if (width) {
      style = { width };
    }
    if (hideBorder) {
      className += ' master-without-border';
    }
    return (
      <ul className={className} style={style}>
        {this.state.masterSource.map((item, index) => {
          let content = null;
          if (config.master) {
            content = config.master(item, index);
          } else {
            content = [
              // header
              <header key="header">{item[config.title]}</header>
            ];
            if (typeof config.section === 'function') {
              content.push(
                <section key="section">{config.section(item)}</section>
              );
            }
          }

          let className = 'master-item';
          // FIXME(Yorkie): weird problem, the state.selected has been
          // converted to string
          if (parseInt(selected) === index) {
            className += ' active';
          }
          let href = this.state.pathname + '/' + item.id;
          if (!href.startsWith('/')) {
            href = '/' + href;
          }
          return (
            <li key={index} className={className}>
              <Link href={href}>{content}</Link>
            </li>
          );
        })}
      </ul>
    );
  }
  renderDetail(props, states) {
    const config = this.props.masterConfig || {};
    const source = this.state.masterSource;
    let selected;
    if (props.id) {
      selected = this.getSelected(props.id);
    } else {
      selected = 0;
    }
    const detail = source[selected];
    if (!detail) {
      return <section className="detail-container"></section>;
    }
    let component;
    if (config.detail && config.detail.component) {
      component = config.detail.component;
    } else {
      component = detail.component;
    }
    if (!component) {
      return <section className="detail-container"></section>;
    }
    return (
      <section className="detail-container">
        {React.createElement(
          component,
          {
            data: detail
          }
        )}
      </section>
    );
  }
}

module.exports = MasterDetail;