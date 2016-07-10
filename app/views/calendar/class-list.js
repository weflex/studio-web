const moment = require('moment');
moment.locale('zh-cn');

class ClassList {

  constructor (optionalArray) {
    this._list = [];

    if (optionalArray && optionalArray.length > 0) {
      for (var i=0; i< optionalArray.length; i++) {
        this.addItem(optionalArray[i]);
      }
    }
  }

  addItem (item) {
    const {hour, minute} = item.from;
    if (!item.start) {
      item.start = moment(item.date)
        .startOf('day')
        .add(hour, 'hours')
        .add(minute, 'minutes');
    }
    this._list.push(item);
  }

  _filterBy (key, value) {
    return new ClassList(this._list.filter((object) => {
      return object.start.isSame(value, key);
    }));
  }

  filterByWeek (value) {
    return this._filterBy('week', value);
  }

  filterByDay (value) {
    return this._filterBy('day', value);
  }

  filterByHour (value) {
    return this._filterBy('hour', value);
  }

  filterByMinute (value) {
    return this._filterBy('minute', value);
  }

  filterByTrainer (trainer) {
    return new ClassList(this._list.filter((object) => {
      return object.trainer.id === trainer.id;
    }));
  }

  get () {
    return this._list;
  }
}

module.exports = ClassList;
