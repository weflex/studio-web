"use strict";

import React from 'react';
import moment from 'moment';
import './resource.css';

const client = require('@weflex/gian').getClient('dev');

class Resource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templates: []
    };
  }
  async componentDidMount() {
    this.setState({
      templates: await client.classTemplate.list({
        include: 'trainer'
      })
    });
  }
  render() {
    return (
      <div className="resource-calendar">
        <div className="resource-calendar-links">
          <a>添加模版</a>
          <a>管理模版</a>
        </div>
        <ul className="resource-calendar-templates">
          {this.state.templates.map((item, index) => {
            return (
              <li key={index} className="resource-calendar-template">
                <div>{item.name}</div>
                <div>{'时长1小时'}</div>
                <div>{item.trainer.fullname.first}</div>
                <div className="resource-calendar-template-hint">
                  <div className="icon-font icon-attach"></div>
                  <div className="hint-text">拖动模版创建课程</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

Resource.propTypes = {
  
};

exports.Resource = Resource;
