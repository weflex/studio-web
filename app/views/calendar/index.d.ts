import * as moment from "moment";
import HourMinute from "../../lib/hour-minute";

export interface CalendarContext {
  viewDate: moment.Moment;
  viewMode: string;
  setViewDate(viewDate: moment.Moment);
}

export interface ClassEvent {
  from: HourMinute,
  date: Date,
  start?: moment.Moment,
  trainer?: {
    id: string
  }
}
