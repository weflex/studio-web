import './index.css';
import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../util/api';
import { range } from 'lodash';
import { Radio, Checkbox, Select, Button } from 'antd';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
const Option = Select.Option;
const RadioGroup = Radio.Group;

class TrainerSchedule extends React.Component {

  static propTypes = {
    trainerId: React.PropTypes.string,
    schedule: React.PropTypes.object,
    onComplete: React.PropTypes.func,
    intl: intlShape.isRequired,
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
    const { intl } = this.props;
    const venueId = (await client.user.getVenueById()).id;
    const wildcard = [{ id: '*', name: intl.formatMessage({id: 'studio_web_membership_wildcard'}) }];
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
    const { datetime, durationMinutes, paymentOptionIds, orderMode } = this.state.schedule;
    try {
      await client.ptSchedule.create({
        trainerId: this.props.trainerId,
        datetime,
        durationMinutes,
        paymentOptionIds,
        orderMode,
        venueId: this.cache.venueId,
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
    const { intl } = this.props;
    const weekName = [
      intl.formatMessage({id: 'studio_web_week_day_sunday'}),
      intl.formatMessage({id: 'studio_web_week_day_monday'}),
      intl.formatMessage({id: 'studio_web_week_day_tuesday'}),
      intl.formatMessage({id: 'studio_web_week_day_wednesday'}),
      intl.formatMessage({id: 'studio_web_week_day_thursday'}),
      intl.formatMessage({id: 'studio_web_week_day_friday'}),
      intl.formatMessage({id: 'studio_web_week_day_saturday'}),
    ];
    const { schedule, scheduleIndex } = this.state;

    return [1, 2, 3, 4, 5, 6, 0].map(i => {
      let className = 'schedule-day-item';
      if (schedule.datetime[i].length > 0) {
        className += ' schedule-day-item-border';
      }
      if (scheduleIndex === i) {
        className += ' schedule-day-item-background';
      }
      return <Button className={className}
                     onClick={() => { this.setState({ scheduleIndex: i }) }}>
                <FormattedMessage id="studio_web_week_day"/>{weekName[i]}
             </Button>
    });
  }

  render() {
    let { schedule } = this.state;
    const { scheduleIndex } = this.state;
    const { intl } = this.props;
    const { datetime, durationMinutes, paymentOptionIds, orderMode } = this.state.schedule;
    return (
      <UIFramework className='trainer-schedule'>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_trainer_detail_private_class_schedule_time'})}>
          {this.renderSchedule()}
          <Checkbox.Group
            options={
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
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_trainer_detail_private_class_course_duration'})}>
          <UIFramework.TextInput
            bindStateCtx={this}
            bindStateName='schedule.durationMinutes'
            value={durationMinutes}
            flex={0.9} />
          <span className="weflex-ui-text"><FormattedMessage id="studio_web_duration_minute" /></span>
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_trainer_schedule_reservation_method'})}>
          <RadioGroup onChange={this.onChange} value={orderMode} onChange={(e) => {
            schedule.orderMode = e.target.value;
            this.setState({ schedule });
          }}>
            <Radio value={"整点预约"}>
              <FormattedMessage id="studio_web_trainer_detail_private_class_radio_option_mode_full_duration"/>
            </Radio>
            <Radio value={"半小时预约"}>
              <FormattedMessage id="studio_web_trainer_detail_private_class_radio_option_mode_half_duration"/>
            </Radio>
          </RadioGroup>
        </UIFramework.Row>
        <UIFramework.Row name={intl.formatMessage({id: 'studio_web_trainer_detail_private_class_associate_card'})}>
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
          {intl.formatMessage({id: "studio_web_btn_save"})}
        </UIFramework.Button>
      </UIFramework>
    );
  }
}

module.exports = injectIntl(TrainerSchedule);
