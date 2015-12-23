'use strict';
const React = require('react');
const events = {};

export class SearchInput extends React.Component {
  static Listen (name, trigger) {
    if (typeof trigger !== 'function') {
      throw new TypeError('trigger must be callable function');
    }
    if (!Array.isArray(events[name])) {
      events[name] = [];
    }
    events[name].push(trigger);
  }
  static Emit (name, val) {
    (events[name] || []).forEach(trigger => {
      trigger(val);
    });
  }
  constructor () {
    super();
    this.state = {
      searchText: ''
    };
  }
  render () {
    return (
      <div className='search'>
        <div className='search-box'>
          <input type="text"
            ref="keywords"
            onChange={this._onchange.bind(this)} 
          />
          <i className='icon-font icon-search'></i>
        </div>
      </div>
    ); // place-holder
  }
  _onchange () {
    SearchInput.Emit('onChange', this.refs.keywords.value);
  }
}
