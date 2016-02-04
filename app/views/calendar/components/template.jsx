"use strict";

import React from 'react';
import ClassCard from '../card';
import { client } from '../../../api';
import './template.css';

class Template extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCopyCard: false
    };
  }
  onPanStart(event) {
    this.setState({
      showCopyCard: true
    });
  }
  onPanEnd(event, data) {
    // TODO(Yorkie): this will move to calendar.updateClasses
    client.class.create({
      date: data.date,
      from: data.from,
      to: data.to,
      // TODO(Yorkie): will remove
      spots: {},
      templateId: data.template.id,
      trainerId: data.trainer.id,
    });
    this.setState({
      showCopyCard: false
    });
    this.props.onRelease(data);
  }
  render() {
    let data = {
      id: Date.now(),
      date: '2016-02-01',
      from: { hour: 0, minute: 0 },
      to: { hour: 1, minute: 30 },
      template: this.props.data,
      trainer: this.props.data.trainer,
      orders: []
    };
    let cardStyle;
    if (this.state.showCopyCard) {
      cardStyle = {
        opacity: 1
      };
    } else {
      cardStyle = {
        opacity: 0,
        top: 0,
        left: 0,
        marginTop: 0,
        marginLeft: 0
      };
    }
    return (
      <li className="resource-calendar-template">
        <div>{this.props.data.name}</div>
        <div>{'时长1小时'}</div>
        <div>{this.props.data.trainer.fullname.first}</div>
        <div className="resource-calendar-template-hint">
          <div className="icon-font icon-copy"></div>
          <div className="hint-text">拖动模版创建课程</div>
        </div>
        <ClassCard
          className="class-copy-card"
          style={cardStyle}
          calendar={this.props.calendar}
          cardInfo={data}
          isEmptyFrom={true}
          onPanStart={this.onPanStart.bind(this)}
          onPanEnd={this.onPanEnd.bind(this)}
        />
      </li>
    );
  }
}

module.exports = Template;
