import './index.css';
import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';
import { range } from 'lodash';
import { Radio, Checkbox, Select, Button } from 'antd';
const Option = Select.Option;
const RadioGroup = Radio.Group;

class TrainerSchedule extends React.Component {

  static propTypes = {
    trainerId: React.PropTypes.string,
    schedule: React.PropTypes.object,
    onComplete: React.PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      scheduleIndex: 1,
      classPackages: [],
      schedule: Object.assign({ datetime: [[], [], [], [], [], [], []] }, props.schedule),
    }

    this.cache = {
      venueId: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ 'schedule': Object.assign({ datetime: [[], [], [], [], [], [], []] }, nextProps.schedule) });
  }

  async componentDidMount() {
    const venueId = (await client.user.getVenueById()).id;
    const wildcard = [{ id: '*', name: '所有会卡' }];
    const classPackages = await client.classPackage.list(
      {
        where: {
          venueId,
        },
      }
    );
    this.cache.venueId = venueId;
    this.setState({
      classPackages: wildcard.concat(classPackages),
    });
  }

  async onSubmit() {
    const { datetime, durationMinutes, paymentOptionIds, orderMode,price } = this.state.schedule;
    try {
      await client.ptSchedule.create({
        trainerId: this.props.trainerId,
        datetime,
        durationMinutes,
        paymentOptionIds,
        orderMode,
        venueId: this.cache.venueId,
        price
      });
      // this.props.onComplete(this.state.schedule);
      location.href = '/trainer'
    } catch (error) {
      console.error(error && error.message);
    }
  }

  onScheduleDatetimeChange(event) {
    const { scheduleIndex, schedule } = this.state;
    schedule.datetime[scheduleIndex] = event;
    this.setState({ schedule });
  }

  renderSchedule() {
    const weekName = ['日', '一', '二', '三', '四', '五', '六'];
    const { schedule, scheduleIndex } = this.state;

    return [1, 2, 3, 4, 5, 6, 0].map(i => {
      let className = 'schedule-day-item';
      if (schedule.datetime[i].length > 0) {
        className += ' schedule-day-item-border';
      }
      if (scheduleIndex === i) {
        className += ' schedule-day-item-background';
      }
      return <Button className={className} onClick={() => { this.setState({ scheduleIndex: i }) }}>周{weekName[i]}</Button>
    });
  }

  render() {
    let { schedule } = this.state;
    const { scheduleIndex } = this.state;
    const { datetime, durationMinutes, paymentOptionIds, orderMode,price } = this.state.schedule;
    return (
      <UIFramework className='trainer-schedule'>
        <UIFramework.Row name="排课时间" hint="">
          {this.renderSchedule()}
          <Checkbox.Group
            options = {
              range(6, 23).map(item => {
                return {
                  label: (item > 9 ? item : '0' + item) + ':00',
                  value: item,
                }
              })
            }
            onChange={this.onScheduleDatetimeChange.bind(this)}
            value={datetime[scheduleIndex]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="课程时长" hint="">
          <UIFramework.TextInput
            bindStateCtx={this}
            bindStateName='schedule.durationMinutes'
            value={durationMinutes}
            flex={0.9} />
          <span className="weflex-ui-text">分钟</span>
        </UIFramework.Row>
        <UIFramework.Row name="价格" hint="">
          <UIFramework.TextInput 
            flex={0.9}
            bindStateCtx={this}
            bindStateType={Number}
            bindStateName="schedule.price" 
            value={price || 0}
          />
          <UIFramework.Select
            flex={0.1}
            disabled={true}
            options={[
              {text: '元', value: 'yuan'},
            ]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="预约方式" hint="">
          <RadioGroup onChange={this.onChange} value={orderMode} onChange={(e) => {
            schedule.orderMode = e.target.value;
            this.setState({ schedule });
          }}>
            <Radio value={"整点预约"}>整点预约</Radio>
            <Radio value={"半小时预约"}>半小时预约</Radio>
          </RadioGroup>
        </UIFramework.Row>
        <UIFramework.Row name="关联会卡" hint="">
          <Select mode='multiple'
            value={paymentOptionIds}
            onChange={(e) => {
              if (e.indexOf('*') > -1) {
                schedule.paymentOptionIds = ['*'];
              } else {
                schedule.paymentOptionIds = e;
              }
              this.setState({ schedule });
            }}
            style={{ width: '100%' }}>
            {
              this.state.classPackages.map((classPackage, key) =>
                <Option value={classPackage.id} key={key}>{classPackage.name}</Option>
              )
            }
          </Select>
        </UIFramework.Row>
        <UIFramework.Button
          onClick={() => this.onSubmit()}
          disabled={!(datetime.length > 0 && durationMinutes && paymentOptionIds && paymentOptionIds.length > 0)}
        >
          保存
        </UIFramework.Button>
      </UIFramework>
    );
  }
}

module.exports = TrainerSchedule;
