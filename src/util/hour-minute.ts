import * as moment from "moment";

declare interface HourMinuteConvertible {
  hour: number;
  minute: number;
}

export default class HourMinute implements HourMinuteConvertible {

  hour: number;
  minute: number;
  private _duration: moment.Duration;

  constructor (origin: HourMinuteConvertible) {
    this._duration = moment.duration(origin.hour, 'hours').add(origin.minute, 'minutes');
    this._justify();
  }

  // MARK: - non-mutating manipulation methods

  adding (time: HourMinuteConvertible): HourMinute {
    const duration = moment.duration(this._duration);
    duration.add(time.hour, 'hours');
    duration.add(time.minute, 'minutes');
    return new HourMinute({
      hour: duration.hours(),
      minute: duration.minutes()
    });
  }

  subtracting (time: HourMinuteConvertible): HourMinute {
    const duration = moment.duration(this._duration);
    duration.subtract(time.minute, 'minutes');
    duration.subtract(time.hour, 'hours');
    return new HourMinute({
      hour: duration.hours(),
      minute: duration.minutes()
    });
  }

  // MARK: - mutating manipulation methods

  add (time: HourMinuteConvertible): HourMinute {
    this._duration.add(time.hour, 'hours').add(time.minute, 'minutes');
    this._justify();
    return this;
  }

  addHours (hours: number): HourMinute {
    return this.add({hour: hours, minute: 0});
  }

  addMinutes (minutes: number): HourMinute {
    return this.add({hour: 0, minute: minutes});
  }

  subtract (time: HourMinuteConvertible): HourMinute {
    this._duration.subtract((new HourMinute(time))._duration);
    this._justify();
    return this;
  }

  subtractHours (hours: number): HourMinute {
    return this.subtract({hour: hours, minute: 0});
  }

  subtractMinutes (minutes: number): HourMinute {
    return this.subtract({hour: 0, minute: minutes});
  }

  snapToMinutes (perMinutes: number): HourMinute {
    const overhead = this.minute % perMinutes;
    this._duration.subtract(overhead, 'minutes');
    this._justify();
    return this;
  }

  // MARK: - exportation methods

  asHours (): number {
    return this._duration.asHours();
  }

  asMinutes (): number {
    return this._duration.asMinutes();
  }

  format (): string {
    return this.hour + ':' + this.minute;
  }

  // MARK: - private methods

  private _justify () {
    this.hour = this._duration.hours();
    this.minute = this._duration.minutes();
  }
}
