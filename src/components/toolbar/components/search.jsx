"use strict";

import React from 'react';

export class SearchInput extends React.Component {
  constructor () {
    super();
    this.state = {
      onChange: null
    };
  }
  initAndListen (handler) {
    if (typeof handler === 'function') {
      const onChange = () => {
        handler(this.refs.keyword.value);
      };
      this.setState({ onChange });
    }
  }

  addMixpanel() {
    const name = this.props.name.substr(0,2);
    mixpanel.track( name + "：搜索" );
  }

  render () {
    if (this.state.onChange) {
      return (
        <div className='search'>
          <input type="text"
                 ref="keyword"
                 onChange={this.state.onChange.bind(this)}
                 onClick={this.addMixpanel.bind(this)} />
          <i className='icon-font icon-search'></i>
        </div>
      );
    } else {
      return null;
    }
  }
}
