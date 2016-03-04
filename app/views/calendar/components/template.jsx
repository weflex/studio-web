"use strict";

import React from 'react';
import ClassCard from '../card';
import moment from 'moment';
import { DropModal } from 'boron2';
import { NewClassTemplate } from '../new';
import { client } from '../../../api';
import './template.css';

class Template extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCopyCard: false,
      data: null,
    };
  }
  onPanStart(event) {
    this.setState({
      showCopyCard: true,
    });
  }
  onPanEnd(event, data) {
    this.setState({
      showCopyCard: false,
      data
    });
    this.refs.classConfirmModal.show();
  }
  get classConfirmation () {
    if (this.state.data) {
      let onCreateClass = (data) => {
        this.refs.classConfirmModal.hide();
        this.props.onRelease(data);
      };
      return (
        <NewClassTemplate
          data={this.state.data} 
          onCreateClass={onCreateClass}
        />
      );
    } else {
      return null;
    }
  }
  render() {
    const template = this.props.data;
    const currentDate = moment(
      this.props.calendar.state.currentDate.toDate());
    const data = {
      id: null,
      date: currentDate.startOf('isoWeek').toDate(),
      from: {
        hour: 0, minute: 0
      },
      to: {
        hour: parseInt(template.during / 60),
        minute: parseInt(template.during % 60)
      },
      spots: {},
      template: template,
      trainer: template.trainer,
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
        <div>{template.name}</div>
        <div>{template.during}分钟</div>
        <div>
          {template.trainer.fullname.first} 
          {template.trainer.fullname.last}
        </div>
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
        <DropModal ref="classConfirmModal">
          {this.classConfirmation}
        </DropModal>
      </li>
    );
  }
}

module.exports = Template;
