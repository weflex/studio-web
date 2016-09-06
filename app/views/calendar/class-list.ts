"use strict"

/**
 * @module calendar
 */

import * as moment from "moment";
import HourMinute from "../../lib/hour-minute";
import {ClassEvent} from "./index.d"
moment.locale("zh-cn");

/**
 * @class ClassList
 */
export default class ClassList {

  private _list: Array<ClassEvent> = [];

  /**
   * @method constructor
   * @param {Array} optionalArray
   */
  constructor(optionalArray?: Array<ClassEvent>) {
    if (optionalArray && optionalArray.length > 0) {
      optionalArray.forEach((item: ClassEvent) => this.addItem(item));
    }
  }

  /**
   * @method addItem
   * @param {Object} item
   * @param {hour: Number, minute: Number} item.from
   * @param {Moment} item.start, optional
   * @param {Moment} item.date
   */
  addItem(item: ClassEvent) {
    const { hour, minute } = item.from;
    item.start = moment(item.date)
      .startOf('day')
      .add(hour, 'hours')
      .add(minute, 'minutes');
    this._list.push(item);
  }

  /**
   * @method _filterBy
   * @param {String} key - the filter key.
   * @param {String} val - the filter value.
   * @private
   * @return {ClassList} return the new ClassList object.
   */
  private _filterBy(key: string, val: string): any {
    return new ClassList(this._list.filter((object) => {
      return object.start.isSame(val, key);
    }));
  }

  /**
   * @method filterByWeek
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByWeek(val: string): any {
    return this._filterBy('week', val);
  }

  /**
   * @method filterByDay
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByDay(val: string): any {
    return this._filterBy('day', val);
  }

  /**
   * @method filterByHour
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByHour(val: string): any {
    return this._filterBy('hour', val);
  }

  /**
   * @method filterByMinute
   * @param {String} val
   * @return {ClassList} return the new ClassList object.
   */
  filterByMinute(val: string): any {
    return this._filterBy('minute', val);
  }

  /**
   * @method filterByTrainer
   * @param {Trainer} trainer
   * @return {ClassList} return the new ClassList object.
   */
  filterByTrainer(trainer: {id?: string}): ClassList {
    return new ClassList(this._list.filter((object) => {
      return object.trainer.id === trainer.id;
    }));
  }

  removeItemById(id: string) {
    this._list = this._list.filter((item) => item.id !== id);
  }

  get(): Array<ClassEvent> {
    return this._list;
  }
}
