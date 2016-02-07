"use strict";

import React from 'react';
import { 
  Location,
  Locations,
  Link
} from 'react-router-component';
import './index.css';

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
    let selected = this.getSelected(masterSource);
    if (!pathname) {
      pathname = window.location.pathname;
    }
    this.setState({
      pathname,
      selected,
      masterSource,
      loading: false
    });
  }
  componentDidUpdate(prevProps, prevState) {
    let selected = this.getSelected();
    if (selected !== prevState.selected) {
      this.setState({selected});
    }
  }
  getSelected(masterSource: Object) {
    masterSource = masterSource || this.state.masterSource;
    let winPathname = window.location.pathname;
    let basePathname = winPathname.replace(this.state.pathname, '');
    let selected = 0;
    for (let index in masterSource) {
      let source = masterSource[index];
      if (source.pathname === basePathname) {
        selected = index;
        break;
      }
    }
    return selected;
  }
  render() {
    let className = 'master-detail';
    if (this.props.className) {
      className += (' ' + this.props.className);
    }
    return (
      <div className={className}>
        {this.renderMaster()}
        {this.renderDetail()}
      </div>
    );
  }
  renderMaster() {
    const config = this.props.masterConfig || {
      title: 'title',
      section: null
    };
    return (
      <ul className="master">
        {this.state.masterSource.map((item, index) => {
          let header = <header>{item[config.title]}</header>;
          let section = null;
          if (typeof config.section === 'function') {
            section = <section>{config.section(item)}</section>;
          }
          let className = 'master-item';
          // FIXME(Yorkie): weird problem, the state.selected has been
          // converted to string
          if (parseInt(this.state.selected) === index) {
            className += ' active';
          }
          return (
            <li key={index} className={className}>
              <Link href={this.state.pathname + item.pathname}>
                {header}
                {section}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  renderDetail() {
    let selected = this.state.selected;
    let detail = this.state.masterSource[selected];
    if (!detail || !detail.component) {
      return <section className="detail"></section>;
    }
    return (
      <section className="detail">
        <detail.component {...detail.props} />
      </section>
    );
  }
}

module.exports = MasterDetail;