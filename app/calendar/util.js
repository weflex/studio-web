import moment from 'moment';
const CELL_HEIGHT = 50;

function getCardWidth(length) {
  return (1 / length * 100) + '%';
}

function getRoundTime(time) {
  const {minute} = time;
  const newTime = Object.assign({}, time);
  if (0 <= minute && minute <= 29) {
    if (minute <= 14) {
      newTime.minute = 0;
    } else {
      newTime.minute = 30;
    }
  } else if (minute > 29) {
    if (minute <= 44) {
      newTime.minute = 30;
    } else {
      newTime.minute = 0;
      newTime.hour = newTime.hour + 1;
    }
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

  return `${hour}:${minute}`;
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
    minute = (offsetHour - hour) * 60;
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
