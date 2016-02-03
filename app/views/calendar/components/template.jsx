"use strict";

import React from 'react';
import './template.css';

class Template extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      name: props.data.name,
      //TODO: add `duration`
      trainer: props.data.trainer
    };
  }

  render () {
    return (
      <li key={this.props.key} className="resource-calendar-template">
        <div className='resource-calendar-template-name'>{this.state.name}</div>
        <div className='resource-calendar-template-duration'>{'时长一小时'}</div>
        <div className='resource-calendar-template-trainer'>
          {this.state.trainer.fullname.first + ' ' + this.state.trainer.fullname.last}
        </div>
        <div className="resource-calendar-template-hint">
          <div className="icon-font icon-copy"></div>
          <div className="hint-text">拖动模版创建课程</div>
        </div>
      </li>
    );
  }
}

module.exports = Template;
