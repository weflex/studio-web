"use strict";

/**
 * @module calendar
 */

import React from 'react';
import moment from 'moment';
import { CCViewMode } from '../calendar-controller';
import './week-picker.css';

/**
 * @class WeekPicker
 * @extends React.Component
 */
export class WeekPicker extends React.Component {

  /**
   * @property {Object} propTyoes - the type definition of props.
   * @static
   */
  static propTypes = {
    calendar: React.PropTypes.object.isRequired
  };

  /**
   * @method constructor
   * @param {Object} props - the props of this component.
   * @return {WeekPicker} return the instance of `WeekPicker`.
   */
  constructor (props) {
    super(props);
    this.calendar = this.props.calendar;
    this.state = {
      viewDate: this.calendar.viewDate,
      viewMode: this.calendar.viewMode
    };
    this.calendar.setPicker(this);
  }

  /**
   * @method goPrev
   * @return {undefined}
   */
  goPrev () {
    const viewDate = this.calendar.viewDate;
    const viewMode = this.calendar.viewMode;
    const newDate = viewDate.subtract(1, viewMode);
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

  /**
   * @method goNext
   * @return {undefined}
   */
  goNext () {
    const viewDate = this.calendar.viewDate;
    const viewMode = this.calendar.viewMode;
    const newDate = viewDate.add(1, viewMode);
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

  /**
   * @method getTitleString
   * @return {String} the formatted string as the title.
   */
  getTitleString () {
    const viewDate = moment(this.calendar.viewDate);
    const viewMode = this.calendar.viewMode;
    const t = 'MM[月]DD[日]';
    if (CCViewMode.week === viewMode) {
      return viewDate.startOf('week').format(t) + ' - ' + viewDate.endOf('week').format(t);
    } else {
      return viewDate.format(t);
    }
  }

  /**
   * @method onSwitch
   * @param {CCViewMode} event
   * @return {undefined}
   */
  onSwitch (e) {
    this.calendar.setViewMode(e);
    this.setState({ viewMode: e });
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="week-picker">
        <span className="go-prev-btn icon-font icon-left-open"
          onClick={this.goPrev.bind(this)}>
        </span>
        <div className="week-date">{ this.getTitleString() }</div>
        <span className="go-next-btn icon-font icon-right-open"
          onClick={this.goNext.bind(this)}>
        </span>
      </div>
    );
  }
}
