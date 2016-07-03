import React from 'react';
import moment from 'moment';
import './day-picker.css';

class DayPicker extends React.Component {
  constructor(props) {
    super(props);
    this.calendar = this.props.calendar;
    this.state = {
      viewDate: moment()
    };
  }

  goPrevDay() {
    const { viewDate } = this.props.calendar.state;
    const newDate = viewDate.subtract(1, 'days');
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

  goNextDay() {
    const { viewDate } = this.props.calendar.state;
    const newDate = viewDate.add(1, 'days');
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

  getDateString(date, formatString) {
    return moment(date).format(formatString);
  }

  render() {
    return (
      <div className="day-picker">
        <span className="go-prev-btn icon-font icon-left-open"
          onClick={this.goPrevDay.bind(this)}>
        </span>
        <div className="day-date">{ this.getDateString(this.state.viewDate, 'MM[月]DD[日]') }</div>
        <span className="go-next-btn icon-font icon-right-open"
          onClick={this.goNextDay.bind(this)}>
        </span>
      </div>
    );
  }
}

DayPicker.propTypes = {
  calendar: React.PropTypes.object.isRequired
};

exports.DayPicker = DayPicker;
