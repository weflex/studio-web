"use strict";

import React from 'react';
import UIFramework from 'weflex-ui';
import _ from 'lodash';
import {client} from '../../api';
import hourminute from 'hourminute';
import moment from 'moment';
import {Checkbox, Select} from 'antd';
const Option = Select.Option;

class TrainerSchedule extends React.Component {
  constructor (props) {
    super(props);
    const defaultSchedule = {
      paymentOptions: [],
      hours: [],
      days: [],
    };
    this.state = {
      schedule: Object.assign({}, defaultSchedule, this.props.schedule),
      classPackages: [],
    }
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.schedule) {
      this.setState({
        schedule: Object.assign({}, nextProps.schedule),
      });
    }
  }
  async componentDidMount () {
    const venue = await client.user.getVenueById();
    const wildcard = [{id: '*', name: '所有会卡'}];
    const classPackages = await client.classPackage.list(
      {
        where: {
          venueId: venue.id,
        },
      }
    );
    this.setState({
      classPackages: wildcard.concat(classPackages),
    });
  }
  async onSubmit () {
    try {
      await client.ptSchedule.create({
        trainerId: this.props.trainerId,
        days: this.state.schedule.days,
        hours: this.state.schedule.hours,
        durationMinutes: this.state.schedule.durationMinutes,
        paymentOptionIds: this.state.schedule.paymentOptionIds,
      });
      this.props.onComplete();
      this.props.onComplete(this.state.schedule);
    } catch (error) {
      console.error(error && error.message);
    }
  }
  render () {
    const ptSchedule = this.state.schedule;
    const hours = _.range(6, 23).map((hour) => {
      return {
        label: hourminute({hour}).format(),
        value: hour,
      };
    });
    const days = _.range(1, 8).map((day) => {
      return {
        label: moment().isoWeekday(day).format('ddd'),
        value: day,
      };
    });
    return (
      <UIFramework className='trainer-schedule'>
        <UIFramework.Row name="排课时间" hint="">
          <Checkbox.Group
            onChange={(e) => {
              ptSchedule.days = e;
              this.setState({
                schedule: ptSchedule,
              });
            }}
            options={days}
            value={ptSchedule.days} />      
        </UIFramework.Row>
        <UIFramework.Row name="" hint="">
          <Checkbox.Group
            options={hours}
            onChange={(e) => {
              ptSchedule.hours = e;
              this.setState({
                schedule: ptSchedule,
              });
            }}
            value={ptSchedule.hours} />
        </UIFramework.Row>
        <UIFramework.Row name="课程时长" hint="">
          <UIFramework.TextInput
            bindStateCtx={this}
            bindStateName='schedule.durationMinutes'
            value={ptSchedule.durationMinutes}
            flex={0.9}/>
          <UIFramework.TextInput className='plain' flex={0.1} value='分钟' disabled />
        </UIFramework.Row>
        <UIFramework.Row name="关联会卡" hint="">
          <Select multiple
                  value={ptSchedule.paymentOptionIds}
                  onChange={(e) => {
                    if (e.indexOf('*') > -1) {
                      ptSchedule.paymentOptionIds =['*'];
                    } else {
                      ptSchedule.paymentOptionIds = e;
                    }
                    this.setState({schedule: ptSchedule});
                  }}
                  style={{width: '100%'}}>
            {
              this.state.classPackages.map((classPackage, key) =>
                <Option value={classPackage.id} key={key}>{classPackage.name}</Option>
              )
            }
          </Select>
        </UIFramework.Row>
        <UIFramework.Button onClick={() => this.onSubmit()}>
          保存
        </UIFramework.Button>
      </UIFramework>
    );
  }
}

module.exports = TrainerSchedule;