"use strict";

import Url from 'url';
import React from 'react';
import { 
  Location,
  Locations,
  Link
} from 'react-router-component';
import { SearchInput } from '../toolbar/components/search';
import './index.css';

/**
 * MasterDetail Component
 *
 * @class MasterDetail
 */
class MasterDetail extends React.Component {

  /**
   * @constructor
   * @param {Object} props - the props to initialize the component
   */
  constructor(props) {
    super(props);
    this.state = {
      /**
       * @state {Number} selected - the selected item number
       */
      selected: 0,

      /**
       * @state {String} sortBy - the sortBy is for saving the current sorting key
       */
      sortBy: null,

      /**
       * @state {String} pathname - the prefix pathname for master item link
       */
      pathname: this.props.pathname || '',

      /**
       * @state {Array} masterSource - the master items source
       */
      masterSource: [],

      /**
       * @state {Element|Null} detail - the detail view
       */
      detail: null,

      /**
       * @state {Boolean} loading - flag the sync state
       */
      loading: true,
    };
    // `cacheMasterSource` is for caching the first data, which can be used at
    // reseting by search input.
    this.cachedMasterSource = null;
    // TODO(Yorkie): this should be decoupled from here, currently the master-detail
    // strongly depends on the `SearchInput`.
    SearchInput.Listen('onChange', this.onSearchInputChange.bind(this));
  }

  /**
   * @event componentWillMount
   * @async
   */
  async componentWillMount() {
    let masterSource = await this.props.masterSource();
    let pathname = this.state.pathname;
    if (!pathname) {
      pathname = window.location.pathname;
    }
    this.cachedMasterSource = masterSource;
    this.setState({
      pathname,
      masterSource,
      loading: false
    });
  }

  async updateMasterSource() {
    let masterSource = await this.props.masterSource();
    this.setState({
      masterSource,
    });
  }

  /**
   * @event onSearchInputChange
   * @param {String} text
   */
  onSearchInputChange(text) {
    if (text === '') {
      this.setState({
        masterSource: this.cachedMasterSource,
      });
    } else {
      this.setState({
        masterSource: this.cachedMasterSource.filter((item) => {
          const title = (this.props.masterConfig && this.props.masterConfig.title) || 'title';
          const keyword = item[title].toLowerCase();
          return keyword.indexOf(text.toLowerCase()) !== -1;
        }),
      });
    }
  }

  /**
   * @event onSortButtonClick
   * @param {Event} event
   */
  onSortButtonClick(event) {
    const sortBy = event.target.value;
    const val = (ctx, exp) => {
      exp = exp || sortBy;
      const dotIndex = exp.indexOf('.');
      if (dotIndex === -1) {
        return ctx[exp];
      } else {
        const firstKey = exp.slice(0, dotIndex);
        return val(ctx[firstKey], exp.slice(dotIndex + 1));
      }
    };
    const op = (sortBy === this.state.sortBy) ? '>' : '<';
    this.setState({
      sortBy,
      masterSource: this.cachedMasterSource.sort((prev, next) => {
        let ret;
        switch (op) {
          case '<': ret = val(prev) < val(next); break;
          case '>': ret = val(prev) > val(next); break;
        }
        return ret;
      }),
    })
  }

  /**
   * Get the selected data
   *
   * @method getSelected
   * @param {Number} the selected id or number, corresponding to the state `selected`.
   */
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

  /**
   * @method render
   */
  render() {
    let className = 'master-detail';
    /**
     * @prop {String} className - the className prop inherited from parent
     */
    if (this.props.className) {
      className += (' ' + this.props.className);
    }
    let masterWidth;
    let detailWidth;
    /**
     * @prop {Number} masterWidth - the master width
     */
    if (this.props.masterWidth) {
      masterWidth = this.props.masterWidth;
      // master has a 1px `border-right` width.
      detailWidth = `calc(100% - ${masterWidth + 1}px)`;
    }

    return (
      <div className={className}>
        {this.renderMaster(masterWidth)}
        <div className="detail" style={{ width: detailWidth }}>
          <Locations contextual>
            <Location path="/" handler={this.renderDetail.bind(this)} />
            <Location path="/:id" handler={this.renderDetail.bind(this)} />
          </Locations>
        </div>
      </div>
    );
  }

  /**
   * rendering the master view (left)
   *
   * @method renderMaster
   * @param {Number} width - the width of master
   */
  renderMaster(width) {
    let pathname = this.state.pathname;
    const id = window.location.pathname.replace(pathname, '').replace(/\//g, '');
    const selected = this.getSelected(id);
    /**
     * @prop {Object} masterConfig - the master config
     */
    const config = this.props.masterConfig || {
      title: 'title',
      section: null
    };

    let theAddButton = null;
    let theSortButton = null;
    let className = 'master';
    let style;
    if (width) {
      style = { 
        width,
      };
    }

    if (config.hideMasterShadow) {
      className += ' master-without-border';
    }
    if (config.iterated) {
      className += ' master-iterator';
      if (config.sortKeys) {
        theSortButton = (
          <li className="master-item master-item-sort">
            <select onChange={this.onSortButtonClick.bind(this)}>
              {config.sortKeys.map((item, index) => {
                return (
                  <option 
                    key={index} 
                    value={item.key}>
                    按{item.name}排序
                  </option>
                );
              })}
            </select>
          </li>
        );
      }
      if (config.onClickAdd) {
        theAddButton = (
          <li className="master-item master-item-add">
            <a onClick={config.onClickAdd}>+{config.addButtonText}</a>
          </li>
        );
      }
    }

    if (config.iterated && config.onClickAdd) {
      className += ' master-iterator';
      theAddButton = (
        <li className="master-item master-item-add">
          <a onClick={config.onClickAdd}>+{config.addButtonText}</a>
        </li>
      );
    }

    return (
      <ul className={className} style={style}>
        {theSortButton}
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
          if (content.length === 1) {
            className += ' hide-bottom-line';
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
        {theAddButton}
      </ul>
    );
  }

  /**
   * rendering the detail view
   *
   * @renderDetail
   * @param {Object} props - the properties to set on detail
   * @param {Object} states - the states to set on detail
   */
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
          Object.assign({
            ref: (instance) => {
              if (instance && typeof this.props.refDetail === 'function') {
                this.props.refDetail(instance);
              }
            },
            data: detail,
            updateMaster: this.updateMasterSource.bind(this),
          }, this.props.detailProps),
        )}
      </section>
    );
  }
}

module.exports = MasterDetail;