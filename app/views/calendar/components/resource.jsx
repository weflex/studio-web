"use strict";

import React from 'react';
import Hammer from 'hammerjs';
import { Link } from 'react-router-component';
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
  async componentWillMount() {
    this.setState({
      templates: await client.classTemplate.list({
        include: 'trainer'
      })
    });
  }
  addMoveHandler(node) {
    if (!node) {
      return;
    }
    const moveHandler = new Hammer(node);
    moveHandler.on('pan', event => {
      console.log(event);
    });
  }
  render() {
    return (
      <div className="resource-calendar">
        <div className="resource-calendar-links">
          <Link href="/class/template/add">添加模版</Link>
          <Link href="/class/template">管理模版</Link>
        </div>
        <ul className="resource-calendar-templates">
          {this.state.templates.map((item, index) => {
            return (
              <li key={index} className="resource-calendar-template">
                <div>{item.name}</div>
                <div>{'时长1小时'}</div>
                <div>{item.trainer.fullname.first}</div>
                <div className="resource-calendar-template-hint" ref={this.addMoveHandler}>
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

exports.Resource = Resource;
