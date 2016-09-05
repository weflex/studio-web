"use strict";

import * as React from 'react';
import * as moment from 'moment';
import './week-picker.css';

interface CalendarContext {
  viewDate: moment.Moment;
  viewMode: string;
  setViewDate(viewDate: moment.Moment);
}

interface PropsType {
  context: CalendarContext
}

interface StateType {
  context: CalendarContext;
}

/**
 * @class WeekPicker
 * @extends React.Component
 */
export class WeekPicker extends React.Component<PropsType, StateType> {

  /**
   * @method constructor
   * @param {Object} props - the props of this component.
   * @return {WeekPicker} return the instance of `WeekPicker`.
   */
  constructor (props: PropsType) {
    super(props);
    this.state = {
      context: props.context
    };
  }

  /**
   * @method render
   */
  render() {
    const context = this.state.context;
    const switchDate = (days) => {
      context.setViewDate(context.viewDate.add(days, context.viewMode));
      this.setState({context: context});
    }
    return (
      <div className="week-picker">
        <span className="go-prev-btn icon-font icon-left-open"
          onClick={() => switchDate(-1)}>
        </span>
        <div className="week-date">{ this.getTitleString() }</div>
        <span className="go-next-btn icon-font icon-right-open"
          onClick={() => switchDate(1)}>
        </span>
      </div>
    );
  }

   /**
   * @method getTitleString
   * @return {String} the formatted string as the title.
   */
  getTitleString () {
    const context = this.state.context;
    const viewDate = moment(context.viewDate);
    const viewMode = context.viewMode;
    const t = 'MMMDo';
    if ('week' === viewMode) {
      return viewDate.startOf('week').format(t) + ' - ' + viewDate.endOf('week').format(t);
    } else {
      return viewDate.format(t);
    }
  }
}