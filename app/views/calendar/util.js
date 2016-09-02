"use strict";

import HourMinute from '../../lib/hour-minute';

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
 * @method transferToPercentage
 * @param {Number} num
 * @return {String} return the percentage string.
 */
export function transferToPercentage(num) {
  return `${num * 100}%`;
}

/**
 * @method getGridHeight
 * @param {hour: Number, minute: Number} from
 * @param {hour: Number, minute: Number} to
 * @param {Number} cellHeight
 */
export function getGridHeight(from, to, cellHeight) {
  const duration = (new HourMinute(to)).subtract(from).asMinutes();
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
