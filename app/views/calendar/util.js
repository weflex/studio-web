"use strict";

/**
 * @module calendar.utils
 */

import _ from 'lodash';
import moment from 'moment';

/**
 * @const {Number} CELL_HEIGHT
 * @value 80
 * @private
 */
const CELL_HEIGHT = 80;

/**
 * @method getCardWidth
 * @param {Number} length
 */
export function getCardWidth (length) {
  return `${1 / length * 100}%`;
}

/**
 * @method getRoundTime
 * @param {Object} time - the time date
 * @param {Number} time.minute - the minute time
 * @param {Number} time.hour - the hour time
 * @param {Number} unit - the unit value, should be 5, 10, 15 and etc.
 */
export function getRoundTime (time, unit) {
  unit = unit || 10;
  let newTime = {};
  // for performance, we move this
  if (time.hour >= 24) {
    newTime.hour = 24;
    newTime.minute = 0;
    return newTime;
  }
  newTime = Object.assign(newTime, time);
  let coll = [];
  for (let v = 0; v <= 60; v += unit) {
    coll.push(v);
  }
  coll.push(time.minute);
  coll.sort((a, b) => {
    if (a === b) {
      return 0;
    } else {
      return (a > b) ? 1 : -1;
    }
  });
  let minuteIdx = coll.indexOf(time.minute);
  if (minuteIdx === -1) {
    // TODO(Yorkie): should use assert instead of error throw
    throw new Error('indexOf should not be -1');
  }
  // because indexOf is using positive sequence
  if (minuteIdx === 0) {
    minuteIdx = 1;
  }
  const distFromLeft = coll[minuteIdx] - coll[minuteIdx - 1];
  const distFromRight = coll[minuteIdx + 1] - coll[minuteIdx];
  if (distFromLeft <= distFromRight) {
    newTime.minute = coll[minuteIdx - 1];
  } else {
    newTime.minute = coll[minuteIdx + 1];
  }
  if (newTime.minute === 60) {
    newTime.minute = 0;
    newTime.hour += 1;
  }
  return newTime;
}

/**
 * @method getFormatTime
 * @param {hour: Number, minute: Number} time - the time to be formatted.
 * @return {String} the formatted string in HH:mm
 */
export function getFormatTime(time) {
  const { hour, minute } = time;
  return moment().hour(hour).minute(minute).format('HH:mm');
}

/**
 * @method getTime
 * @param {String} timestr - the formatted time string in HH:mm
 * @return {hour: Number, minute: Number}
 */
export function getTime(time) {
  const obj = time.split(':');
  return {
    hour: parseInt(obj[0]),
    minute: parseInt(obj[1])
  };
}

/**
 * @method getWeek
 * @param {Date} date - the date in this week.
 * @param {String} formatString - the format string.
 * @return {begin: String, end: String}
 */
export function getWeek(date, formatString) {
  return {
    begin: getWeekBegin(date, formatString),
    end: getWeekEnd(date, formatString)
  };
}

/**
 * @method getWeekBegin
 * @param {Date} date - the date in this week.
 * @param {String} formatString - the format string.
 * @return {Stirng} the start of this week in string by the formatString.
 */
export function getWeekBegin(date, formatString) {
  return moment(date).startOf('week').format(formatString);
}

/**
 * @method getWeekEnd
 * @param {Date} date - the date in this week
 * @param {String} formatString - the format string
 * @return {String} the end of this week in string by the formatString.
 */
export function getWeekEnd(date, formatString) {
  return moment(date).endOf('week').format(formatString);
}

/**
 * @method getCellHeight
 * @return {Number} return the cell height.
 */
export function getCellHeight() {
  return CELL_HEIGHT;
}

/**
 * @method getRange
 * @param {Number} start - the start number.
 * @param {Number} end - the end number.
 * @return {Array} the ranged array.
 */
// TODO(Yorkie): Why should we need this function?
// Why not directly using lodash's range function?
export function getRange(start, end) {
  return _.range(start, end + 1);
}

/**
 * @method addTimeByHour
 * @param {Date} time - the date is based on.
 * @param {Number} offsetHour - the offset in hour.
 * @return {Date} The added date.
 */
export function addTimeByHour(time, offsetHour) {
  let newTime = Object.assign({}, time);
  let hour = Math.floor(offsetHour);
  let minute = Math.floor((offsetHour - hour) * 60);
  if (offsetHour < 0) {
    hour = Math.ceil(offsetHour);
    minute = Math.ceil((offsetHour - hour) * 60);
  }

  newTime.hour += hour;
  newTime.minute += minute;
  if (newTime.minute >= 60) {
    newTime.hour += 1;
    newTime.minute = newTime.minute - 60;
  } else if (newTime.minute < 0) {
    newTime.hour -= 1;
    newTime.minute = newTime.minute + 60;
  }

  if (newTime.hour >= 24) {
    newTime.hour = 24;
    newTime.minute = 0;
  }

  if (newTime.hour < 0) {
    newTime.hour = 0;
    newTime.minute = 0;
  }

  return newTime;
}

/**
 * @method addTimeByMinute
 * @param {Date} time - the date is based on.
 * @param {Number} offsetMinute - the offset in minutes.
 * @return {Date} the added date.
 */
export function addTimeByMinute(time, offsetMinute) {
  let newTime = Object.assign({}, time);
  let hour = Math.floor(offsetMinute / 60);
  let minute = offsetMinute % 60;
  if (offsetMinute < 0) {
    hour = Math.ceil(offsetMinute / 60);
  }
  newTime.hour += hour;
  newTime.minute += minute;

  if (newTime.minute >= 60) {
    newTime.hour += 1;
    newTime.minute = newTime.minute - 60;
  } else if (newTime.minute < 0) {
    newTime.hour -= 1;
    newTime.minute = newTime.minute + 60;
  }

  if (newTime.hour >= 24) {
    newTime.hour = 24;
    newTime.minute = 0;
  }

  if (newTime.hour < 0) {
    newTime.hour = 0;
    newTime.minute = 0;
  }

  return newTime;
}

/**
 * @method transferToPercentage
 * @param {Number} num
 * @return {String} return the percentage string.
 */
export function transferToPercentage(num) {
  return `${num * 100}%`;
}

/**
 * @method getTimeDuration
 * @param {hour: Number, minute: Number} from
 * @param {hour: Number, minute: Number} to
 * @return {Number} the duration number in minutes.
 */
export function getTimeDuration(from, to) {
  return (to.hour - from.hour) * 60 + (to.minute - from.minute);
}

/**
 * @method getGridHeight
 * @param {hour: Number, minute: Number} from
 * @param {hour: Number, minute: Number} to
 * @param {Number} cellHeight
 */
export function getGridHeight(from, to, cellHeight) {
  const duration = getTimeDuration(from, to);
  if (duration <= 0) {
    return 0;
  }
  const borderHeight = Math.floor(duration / 60);
  return (duration / 60) * cellHeight + borderHeight;
}

/**
 * @method getGridOffsetByTime
 * @param {hour: Number, minute: Number} from
 * @param {Number} height
 * @return {Number} the offset
 */
export function getGridOffsetByTime(from, height) {
  return (from.minute / 60) * height;
}

/**
 * @method getDateBySplit
 * @param {hour: Number, minute: Number} newTime
 * @param {Date} date
 * @return {Date} the new date
 */
export function getDateBySplit(newTime, date) {
  if (newTime && 'hour' in newTime && date) {
    const oldDate = moment(date).format('YYYY-MM-DD');
    const newDate = new Date(oldDate + ` ${getFormatTime(newTime)}`);
    return newDate;
  } else {
    return date;
  }
}
