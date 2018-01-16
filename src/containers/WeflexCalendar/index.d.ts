import * as moment from "moment";
import ClassList from "./class-list";
import HourMinute from "../../util/hour-minute";

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
  listClasses(startsAt: moment.Moment, endsAt: moment.Moment): ClassList;
  updateClass(classUpdates: ClassEvent);
  deleteClass(classDeletes: ClassEvent);
  createClass(newClass: ClassEvent);
}
