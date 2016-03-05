"use strict";

import _ from 'lodash';
import moment from 'moment';
const CELL_HEIGHT = 80;

function getCardWidth(length) {
  return (1 / length * 100) + '%';
}

/**
 * @method getRoundTime
 * @param {Object} time - the time date
 * @param {Number} time.minute - the minute time
 * @param {Number} time.hour - the hour time
 * @param {Number} unit - the unit value, should be 5, 10, 15 and etc.
 */
function getRoundTime(time, unit) {
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
  coll.sort((a, b) => a > b);
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

function getFormatTime(time) {
  let hour, minute;
  if (time.minute < 10) {
    minute = '0' + time.minute;
  } else {
    minute = time.minute;
  }

  if (time.hour < 10) {
    hour = '0' + time.hour;
  } else {
    hour = time.hour;
  }
  return hour + ':' + minute;
}

function getWeek(date, format) {
  let weekDate = {};
  weekDate.begin = getWeekBegin(date, format);
  weekDate.end = getWeekEnd(date, format);
  return weekDate;
}

function getWeekEnd(date, formatString) {
  return moment(date).endOf('week').format(formatString);
}

function getWeekBegin(date, formatString) {
  return moment(date).startOf('week').format(formatString);
}

function getCellHeight() {
  return CELL_HEIGHT;
}

function getRange(start, end) {
  if (!end) {
    end = start;
    start = 0;
  }

  let rangeArray = [];

  while (end >= start) {
    rangeArray[start] = start;
    start = start + 1;
  }

  return rangeArray;
}

function addTimeByHour(time, offsetHour) {
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

function addTimeByMinute(time, offsetMinute) {
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

function transferToPercentage(number) {
  return (number * 100) + '%';
}

function getTimeDuration(from, to) {
  return (to.hour - from.hour) * 60 + (to.minute - from.minute);
}

function getGridHeight(from, to, cellHeight) {
  let duration = getTimeDuration(from, to);
  if (duration <= 0) return 0;

  let borderHeight = Math.floor(duration / 60);
  let height = (duration / 60) * cellHeight + borderHeight;
  return height;
}

function getGridOffsetByTime(from, height) {
  let offsetTop = (from.minute / 60) * height;
  return offsetTop;
}

function getDateBySplit(newTime, date) {
  if (newTime && 'hour' in newTime && date) {
    const oldDate = moment(date).format('YYYY-MM-DD');
    const newDate = new Date(oldDate + ` ${getFormatTime(newTime)}`);
    return newDate;
  } else {
    return date;
  }
}

export {
  getWeek,
  getRange,
  getWeekEnd,
  getWeekBegin,
  getRoundTime,
  getFormatTime,
  getCellHeight,
  addTimeByHour,
  getGridHeight,
  getDateBySplit,
  getTimeDuration,
  addTimeByMinute,
  getGridOffsetByTime,
  transferToPercentage,
};
