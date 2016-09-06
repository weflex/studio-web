import * as moment from "moment";
import ClassList from "./class-list";
import HourMinute from "../../lib/hour-minute";

export interface CalendarContext {
  viewDate: moment.Moment;
  viewMode: string;
  setViewDate(viewDate: moment.Moment);
}

export interface ClassEvent {
  id: string,
  from: HourMinute,
  date: Date,
  start?: moment.Moment,
  template: {
    name: string
  },
  trainer?: {
    id: string
  }
}

export interface CalendarDataSource {
  updateClass(classUpdates: ClassEvent);
  deleteClass(classDeletes: ClassEvent);
  createClass(newClass: ClassEvent);
}
