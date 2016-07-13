"use strict";

/**
 * @module calendar
 */

import React from 'react';
import moment from 'moment';
import UIFramework from 'weflex-ui';
import ClassCard from '../card';
import { NewClassTemplate } from '../new';
import { client } from '../../../api';
import './template.css';

/**
 * @class Template
 * @extends React.Component
 */
export default class Template extends React.Component {

  /**
   * @method constructor
   * @param {Object} props
   * @return {Template} the instance of `Template`.
   */
  constructor(props) {
    super(props);
    this.state = {
      showCopyCard: false,
      data: {},
      modalVisibled: false,
    };
  }

  /**
   * @method onPanStart
   * @param {Event} event
   */
  onPanStart(event) {
    this.setState({
      showCopyCard: true,
    });
  }

  /**
   * @method onPanEnd
   * @param {Event} event
   * @param {Object} data
   */
  onPanEnd(event, data) {
    this.setState({
      showCopyCard: false,
      modalVisibled: true,
      data
    });
  }

  /**
   * @getter classConfirmation
   */
  get classConfirmation () {
    if (this.state.data) {
      let onCreateClass = (data) => {
        this.setState({
          modalVisibled: false,
        });
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

  /**
   * @method render
   */
  render() {
    const template = this.props.data;
    const viewDate = moment(
      this.props.calendar.state.viewDate.toDate());
    const data = {
      id: null,
      date: viewDate.startOf('isoWeek').toDate(),
      from: {
        hour: 0, minute: 0
      },
      to: {
        hour: parseInt(template.duration / 60),
        minute: parseInt(template.duration % 60)
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
        marginLeft: 0,
        width: '100%'
      };
    }
    return (
      <li className="resource-calendar-template">
        <div>{template.name}</div>
        <div>{template.duration}分钟</div>
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
        <UIFramework.Modal
          title="添加课程"
          footer=""
          visible={this.state.modalVisibled}
          onCancel={() => this.setState({ modalVisibled: false })}>
          {this.classConfirmation}
        </UIFramework.Modal>
      </li>
    );
  }
}
