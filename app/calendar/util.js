import moment from 'moment';
const CELL_HEIGHT = 50;

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
  newTime.hour += hour;
  newTime.minute += minute;
  if (newTime.minute >= 60) {
    newTime.hour += 1;
    newTime.minute = newTime.minute - 60;
  } else if (newTime.minute < 0) {
    newTime.hour -= 1;
    newTime.minute = newTime.minute + 60;
  }

  return newTime;
}

function addTimeByMinute(time, offsetMinute) {
  let newTime = Object.assign({}, time);
  let hour = Math.floor(offsetMinute / 60);
  let minute = offsetMinute % 60;

  newTime.hour += hour;
  newTime.minute += minute;

  if (newTime.minute >= 60) {
    newTime.hour += 1;
    newTime.minute = newTime.minute - 60;
  } else if (newTime.minute < 0) {
    newTime.hour -= 1;
    newTime.minute = newTime.minute + 60;
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

export {
  getWeek,
  getRange,
  getWeekEnd,
  getWeekBegin,
  getCellHeight,
  addTimeByHour,
  getGridHeight,
  getTimeDuration,
  addTimeByMinute,
  getGridOffsetByTime,
  transferToPercentage,
};
