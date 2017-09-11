import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';
import { Select, Button } from 'antd';
import { startOfWeek, endOfWeek, addWeeks, addDays, format, differenceInDays } from 'date-fns';

class ClassBatch extends React.Component {

  static propTypes = {
    schedule: PropTypes.array,
  };

  constructor(props) {
    super(props);

    this.state = {
      weeks: [],
      classes: [],
      weeksStart: [],
    }

    this.cache = {
      venueId: '',
      dateFormat: 'YYYY年MM月DD日',
      weekStartsOn: 1,
    }
  }

  async componentDidMount() {
    const venueId = (await client.user.getVenueById()).id;
    this.cache.venueId = venueId;

    const classes = this.getClasses(this.props.schedule || []);
    const weeks = await this.getWeeks(classes);

    this.setState({
      weeks,
      classes,
    });
  }
  
  async componentWillReceiveProps(nextProps) {
    const classes = this.getClasses(nextProps.schedule || []);
    const weeks = await this.getWeeks(classes);

    this.setState({
      classes,
      weeks,
    });
  }
  
  getClasses(schedule) {
    const classes = [];

    schedule.forEach((item, i) => {
      if(item.type === 'class' && item.template ) {
        classes.push({
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          paymentOptionIds: item.paymentOptionIds,
          price: item.price || item.template.price,
          spot: item.spot,
          // spotsAvailable: item.spot,
          // spotsBooked: 0,
          duration: item.duration || item.template.duration,
          templateId: item.templateId,
          trainerId: item.trainerId,
          venueId: item.venueId,
          orders: [],
        })
      }
    });

    return classes;
  }

  async getWeeks(classes) {
    if(!classes || classes.length <= 0 ) {
      return [];
    }

    const { dateFormat, venueId, weekStartsOn } = this.cache;
    const now = startOfWeek(new Date(classes[0].startsAt), {weekStartsOn});
    const weeks = [];

    for(let i = 1; i < 13; i++) {
      const startsAt = addWeeks(now, i);
      const endsAt = endOfWeek(startsAt, {weekStartsOn});
      let count = 0;

      try {
        count = ( await client.class.count({
          where: {
            venueId,
            startsAt: {
              between: [startsAt, endsAt]
            },
            trashedAt: {
              exists: false
            }
          }
        }) ).count;

      } catch(error) {
        console.error(error);
      }

      weeks.push({
        start: new Date(startsAt).getTime().toString(),
        startsAt,
        endsAt,
        strStartsAt: format(startsAt, dateFormat),
        strEndsAt: format(endsAt, dateFormat),
        count,
      });
    }

    return weeks;
  }

  async onSubmit() {
    const { weeksStart, classes } = this.state;
    const { weekStartsOn } = this.cache;

    try {
      for (let weekStart of weeksStart) {
        for (let item of classes) {
          const daysDistance = differenceInDays(Number(weekStart), startOfWeek(item.startsAt, {weekStartsOn}) ) ;
          item.startsAt = addDays(item.startsAt, daysDistance);
          item.endsAt = addDays(item.endsAt, daysDistance);
          await client.class.create(item);
        }
      }
      this.setState({weeksStart: []});
      this.props.onComplete();
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const { weeks, classes, weeksStart } = this.state;

    return (
      <UIFramework className='trainer-schedule'>
        <UIFramework.Row name="复制到" hint="">
          <Select mode='multiple'
            value={weeksStart}
            onChange={e => {
              this.setState({ weeksStart: e });
            }}
            style={{ width: '100%' }}
          >
            {
              weeks.map((item, i) =>
                <Select.Option value={ item.start } key={i}>
                  <span>{ `${item.strStartsAt}至${item.strEndsAt}` }</span>
                  {
                    item.count > 0
                      ? <span style={{color: '#f00',marginLeft: '20px'}}>{  `已排${item.count}节课程` }</span>
                      : ''
                  }
                </Select.Option>
              )
            }
          </Select>
        </UIFramework.Row>
        <UIFramework.Button
          onClick={() => this.onSubmit()}
          disabled={ weeksStart.length <= 0 || classes.length <= 0 }
        >
          保存
        </UIFramework.Button>
      </UIFramework>
    );
  }
}

export default ClassBatch;
