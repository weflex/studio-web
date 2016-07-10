import React from 'react';
import moment from 'moment';
import { SwitchTab } from './switch-tab';
import { CCViewMode } from '../calendar-controller';
import './week-picker.css';

class WeekPicker extends React.Component {
  constructor(props) {
    super(props);
    this.calendar = this.props.calendar;
    this.state = {
      viewDate: this.calendar.viewDate,
      viewMode: this.calendar.viewMode
    };
    this.calendar.setPicker(this);
  }

  goPrev() {
    const viewDate = this.calendar.viewDate;
    const viewMode = this.calendar.viewMode;
    const newDate = viewDate.subtract(1, viewMode);
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

  goNext() {
    const viewDate = this.calendar.viewDate;
    const viewMode = this.calendar.viewMode;
    const newDate = viewDate.add(1, viewMode);
    this.setState({ viewDate: newDate });
    this.calendar.setViewDate(newDate);
  }

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

  onSwitch (e) {
    this.calendar.setViewMode(e);
    this.setState({ viewMode: e });
  }

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
        <SwitchTab options={['周视图', '日视图']}
                   events={[CCViewMode.week, CCViewMode.day]}
                   onSwitch={(e) => this.onSwitch(e)}/>
      </div>
    );
  }
}

WeekPicker.propTypes = {
  calendar: React.PropTypes.object.isRequired
};

exports.WeekPicker = WeekPicker;
