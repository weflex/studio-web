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
      currentDate: moment()
    };
  }

  goPrevWeek() {
    const { currentDate } = this.props.calendar.state;
    const newDate = currentDate.subtract(7, 'days');
    this.setState({ currentDate: newDate });
    this.calendar.setCurrentDate(newDate);
  }

  goNextWeek() {
    const { currentDate } = this.props.calendar.state;
    const newDate = currentDate.add(7, 'days');
    this.setState({ currentDate: newDate });
    this.calendar.setCurrentDate(newDate);
  }

  render() {
    const weekDate = getWeek(this.state.currentDate, 'MM[月]DD[日]');
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
