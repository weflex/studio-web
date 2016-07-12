"use strict"

/**
 * @module calendar
 */

import moment from 'moment';
moment.locale('zh-cn');

/**
 * @class ClassList
 */
export default class ClassList {

  /**
   * @method constructor
   * @param {Array} optionalArray
   */
  constructor (optionalArray) {
    this._list = [];
    if (optionalArray && optionalArray.length > 0) {
      optionalArray.forEach((item) => {
        this.addItem(item);
      });
    }
  }

  /**
   * @method addItem
   * @param {Object} item
   * @param {hour: Number, minute: Number} item.from
   * @param {Moment} item.start, optional
   * @param {Moment} item.date
   */
  addItem (item) {
    const { hour, minute } = item.from;
    if (!item.start) {
      item.start = moment(item.date)
        .startOf('day')
        .add(hour, 'hours')
        .add(minute, 'minutes');
    }
    this._list.push(item);
  }

  /**
   * @method _filterBy
   * @param {String} key - the filter key.
   * @param {String} val - the filter value.
   * @private
   * @return {ClassList} return the new ClassList object.
   */
  _filterBy (key, val) {
    return new ClassList(this._list.filter((object) => {
      return object.start.isSame(val, key);
    }));
  }

  /**
   * @method filterByWeek
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByWeek (val) {
    return this._filterBy('week', val);
  }

  /**
   * @method filterByDay
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByDay (val) {
    return this._filterBy('day', val);
  }

  /**
   * @method filterByHour
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByHour (val) {
    return this._filterBy('hour', val);
  }

  /**
   * @method filterByMinute
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByMinute (val) {
    return this._filterBy('minute', val);
  }

  /**
   * @method filterByTrainer
   * @param {Trainer} trainer
   * @return {ClassList} return the new ClassList object.
   */
  filterByTrainer (trainer) {
    return new ClassList(this._list.filter((object) => {
      return object.trainer.id === trainer.id;
    }));
  }

  get () {
    return this._list;
  }
}
