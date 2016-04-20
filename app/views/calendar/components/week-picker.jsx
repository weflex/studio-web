import React from 'react';
import moment from 'moment';
import {
  getWeek
} from '../util';
import './week-picker.css';

class WeekPicker extends React.Component {
  constructor(props) {
    super(props);
    this.calendar = this.props.calendar;
    this.state = {
      viewDate: moment()
    };
  }

  goPrevWeek() {
    const { viewDate } = this.props.calendar.state;
    const newDate = viewDate.subtract(7, 'days');
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

  goNextWeek() {
    const { viewDate } = this.props.calendar.state;
    const newDate = viewDate.add(7, 'days');
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

  render() {
    const weekDate = getWeek(this.state.viewDate, 'MM[月]DD[日]');
    return (
      <div className="week-picker">
        <span className="go-prev-btn icon-font icon-left-open"
          onClick={this.goPrevWeek.bind(this)}>
        </span>
        <div className="week-date">{weekDate.begin} - {weekDate.end}</div>
        <span className="go-next-btn icon-font icon-right-open"
          onClick={this.goNextWeek.bind(this)}>
        </span>
      </div>
    );
  }
}

WeekPicker.propTypes = {
  calendar: React.PropTypes.object.isRequired
};

exports.WeekPicker = WeekPicker;
