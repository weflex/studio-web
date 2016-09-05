import * as moment from 'moment';

export interface CalendarContext {
  viewDate: moment.Moment;
  viewMode: string;
  setViewDate(viewDate: moment.Moment);
}
