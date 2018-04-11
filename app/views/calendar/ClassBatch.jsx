import './index.css';
import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';
import { Select,Spin, Button, TimePicker, Table, DatePicker } from 'antd';
import { keyBy, sortBy, findIndex } from 'lodash';
import { startOfWeek, endOfWeek, addDays, addMinutes, startOfDay, addMonths, format, differenceInDays, setHours, setMinutes } from 'date-fns';
import classnames from 'classnames';
import moment from 'moment';
const async = require('async')
class ClassBatch extends React.Component {

  static propTypes = {
    onComplete: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      weekStartsAt: moment().startOf('week'),
      courseTemplates: {},
      scheduleIndex: 1,
      schedule: [[], [], [], [], [], [], []],
      time: '09:00',
      templateId: '',
      isStateReady:true
    }

    this.cache = {
      venueId: '',
      weekStartsOn: 1,
      dateFormat: 'YYYY-MM-DD',
      ctId: null,
      ctModifiedAt: null,
      columns: [
        {
          title: '时间',
          dataIndex: 'Time',
          width: '25%',
        }, {
          title: '课程名称',
          dataIndex: 'CourseName',
          width: '30%',
        }, {
          title: '教练姓名',
          dataIndex: 'TrainerName',
          width: '30%',
          render: (text, record) => {
            const { trainers, schedule, scheduleIndex } = this.state
            const options = trainers.map((item, index) => {
              return <Select.Option key={"trainer_"+item.id} value={item.id}>{item.fullname.first + item.fullname.last}</Select.Option>
            })
            return <Select value={record.TrainerName} style={{ width: 120 }} onChange={
              (value) => {
                schedule[scheduleIndex][record.id].trainerId = value
                this.setState({
                  schedule
                })
              }
            }>{options}</Select>
          }
        }, {
          title: '操作',
          dataIndex: 'Operation',
          width: '15%',
        }
      ],
    }

    this.onAddTemplate = this.onAddTemplate.bind(this);
    this.onDeleteTemplate = this.onDeleteTemplate.bind(this);
  }


  // async componentWillReceiveProps(nextProps) {
  //   // const schedule = await this.getSchedule();
  //   // const courseTemplates= await this.getCourseTemplates();
  //   // this.setState({
  //   //   courseTemplates,
  //   //   schedule,
  //   // });
  // }

  async getCourseTemplates() {
    const { venueId } = this.cache;
    let classTemplates
    try {
      classTemplates = await client.classTemplate.list({
        where: {
          venueId,
        },
        include: 'trainer',
      });
    } catch (error) {
      console.error(error);
    }
    return keyBy(classTemplates, 'id');
  }

  async componentDidMount() {
    let courseTemplates, schedule, trainers
    try {
      this.cache.venueId = (await client.user.getVenueById()).id;
      courseTemplates = await this.getCourseTemplates();
      schedule = await this.getSchedule();
      trainers = await client.collaborator.list({
        where: {
          venueId: this.cache.venueId,
        }
      });
    } catch (error) {
      console.error(error);
    }
    this.setState({
      courseTemplates,
      schedule,
      trainers,
      isStateReady:false
    });
  }
  async getSchedule() {
    const { venueId } = this.cache;
    let courseTemplateList
    try {
      courseTemplateList = await client.classTempleList.list({
        where: {
          venueId
        }
      });
    } catch (error) {
      console.error(error);
    }
    if (courseTemplateList.length > 0) {
      this.cache.ctId = courseTemplateList[0].id;
      this.cache.ctModifiedAt = courseTemplateList[0].modifiedAt;
      return courseTemplateList[0].classList;
    } else {
      return [[], [], [], [], [], [], []];
    }
  }

  onAddTemplate() {
    const { schedule, scheduleIndex, time, templateId } = this.state;
    if (!time || !templateId) {
      return;
    }
    schedule[scheduleIndex].push({ time, templateId });
    schedule[scheduleIndex] = sortBy(schedule[scheduleIndex], ['time'])
    this.saveCourseTemplate(schedule);
  }

  onDeleteTemplate(time, templateId) {
    const { schedule, scheduleIndex } = this.state;
    schedule[scheduleIndex].splice(findIndex(schedule[scheduleIndex], { time, templateId }), 1);
    this.saveCourseTemplate(schedule);
  }

  async saveCourseTemplate(schedule) {
    const { venueId, ctId, ctModifiedAt } = this.cache;
    try {
      if (!ctId) {
        const resault = await client.classTempleList.create({
          venueId,
          classList: schedule,
        });
        this.cache.ctId = resault.id;
        this.cache.ctModifiedAt = resault.modifiedAt;
      } else {
        const resault = await client.classTempleList.update(ctId, {
          classList: schedule,
        }, ctModifiedAt);
        this.cache.ctModifiedAt = resault.modifiedAt;
      }
      this.setState({ schedule });
    } catch (error) {
      console.error(error);
    }
  }

  getScheduleView() {
    const { schedule, scheduleIndex, courseTemplates } = this.state;
    const scheduleView = [];
    schedule[scheduleIndex].forEach((item, index) => {
      const template = courseTemplates[item.templateId];
      if (template) {
        const { first, last } = template.trainer.fullname;
        scheduleView.push({
          id: index,
          key: "scheduleView_"+index+item.templateId,
          Time: getEndsAt(item.time, template.duration),
          CourseName: template.name,
          TrainerName: item.trainerId || template.trainer.id,
          Operation: <span style={{ color: '#FF8AC2', cursor: 'pointer' }} onClick={e => this.onDeleteTemplate(item.time, item.templateId)}>删除</span>
        });
      }
    });

    function getEndsAt(time, duration) {
      const times = time.split(':');
      const minutes = 60 * Number(times[0]) + Number(times[1]) + duration;
      return `${time} ~ ${it(Math.floor(minutes / 60))}:${it(minutes % 60)}`;
    }

    function it(number) {
      return (number < 10) ? '0' + number : number;
    }
    return scheduleView;
  }

  getCourses() {
    const { weekStartsAt, courseTemplates, schedule } = this.state;
    const { dateFormat } = this.cache;
    const weekStart = weekStartsAt.format(dateFormat);
    const courses = [];
    [1, 2, 3, 4, 5, 6, 0].forEach((item, i) => {
      const date = addDays(weekStart, i);
      schedule[item].forEach((scheduleItem, j) => {
        const { templateId, time, trainerId } = scheduleItem;
        const template = courseTemplates[templateId];
        if (template) {
          const times = time.split(':');
          const startsAt = setHours(setMinutes(date, times[1]), times[0]);
          courses.push({
            fullname: template.trainer.fullname.first + template.trainer.fullname.last,
            startsAt,
            endsAt: addMinutes(startsAt, template.duration),
            description: template.description,
            duration: template.duration,
            name: template.name,
            paymentOptionIds: template.paymentOptionIds,
            price: template.price,
            spot: template.spot,
            templateId,
            trainerId: trainerId || template.trainerId,
            venueId: template.venueId,
            orders: [],
          });
        }
      });
    });
    return courses;
  }

  async onSubmit() {
    const courses = this.getCourses();
    let viewDate = this.props.refs.calendar.state.viewDate
    let startsAt = moment(viewDate).startOf('week')
    let endsAt = moment(viewDate).endOf('week')
    try {
      this.props.onWait()
      let series = courses.map((item) => {
        return async (callback) => {
          let data = {}
          try {
            data = await client.class.create(item)
          } catch (err) {
            return callback(err, null)
          }
          return callback(null, data)
        }
      })
      async.series(series,
        (err, result) => {
          if (err) {
            console.log(err)
          }
          this.setState(
            {
             weekStartsAt: moment().startOf('week')
             }
            );
          this.props.onComplete(startsAt, endsAt);
        }
      )
    } catch (error) {
      console.error(error);
    }
  }

  renderCourseTemplates(courseTemplates) {
    const selects = [];
    for (let key in courseTemplates) {
      const item = courseTemplates[key];
      selects.push(<Select.Option key={"courseTemplates_"+item.id} value={item.id}>{item.name}</Select.Option>);
    }
    return (
      <Select
        size="small"
        className="course-templates"
        showSearch
        placeholder="选择课程模板"
        optionFilterProp="children"
        onChange={value => this.setState({ templateId: value })}
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      >
        {selects}
      </Select>
    );
  }

  renderSchedule() {
    const weekName = ['日', '一', '二', '三', '四', '五', '六'];
    const { schedule, scheduleIndex } = this.state;
    return [1, 2, 3, 4, 5, 6, 0].map(i => {
      let className = classnames({
        'schedule-day': true,
        'schedule-day-notnull': schedule[i].length > 0,
        'schedule-day-select': scheduleIndex === i,
      });
      return <button key={i} className={className} onClick={e => { this.setState({ scheduleIndex: i }) }}>周{weekName[i]}</button>
    });
  }
  get submitDisabled() {
    return !this.state.time || !this.state.templateId
  }

  render() {
    const { weekStartsAt, schedule, scheduleIndex, courseTemplates, time,isStateReady } = this.state;
    const { columns, weekStartsOn, dateFormat } = this.cache;
    return (
      <Spin spinning={isStateReady} size="large" tip="Loading...">
      <UIFramework className='course-schedule'>
        <UIFramework.Row name="创建复制模板">
          <div style={{ marginBottom: '5px' }}>
            {this.renderSchedule()}
          </div>
          <Table
            rowKey={(record) => record.key}
            columns={columns}
            dataSource={this.getScheduleView()}
            pagination={false}
            scroll={{ y: 240 }}
            footer={() =>
              <div>
                <TimePicker
                  defaultValue={moment('09:00', 'HH:mm')}
                  onChange={(value) => {
                    this.setState({
                      time: !value ? '' : ((value.hour() < 10 ? '0' + value.hour() : value.hour()) + ":" + (value.minute() < 10 ? '0' + value.minute() : value.minute())),
                    })
                  }}
                  format={'HH:mm'}
                  flex={0.5} />
                {this.renderCourseTemplates(courseTemplates)}
                <Button size="small" onClick={this.onAddTemplate} disabled={this.submitDisabled}>添加</Button>
              </div>
            }
          />
        </UIFramework.Row>
        <UIFramework.Row name="选择复制时间" hint="时间周期为一周，开始时间为周一。">
          <DatePicker
            className="small"
            value={weekStartsAt}
            onChange={(date, dateString) => { if (date) this.setState({ weekStartsAt: date }) }}
            disabledDate={current => current && current.format('d') !== '1' | current.valueOf() < startOfWeek(new Date()) | current.valueOf() > addMonths(weekStartsAt, 2)}
          />
          <DatePicker
            className="small ml10"
            disabled
            value={moment(endOfWeek(weekStartsAt.format(dateFormat), { weekStartsOn }))}
          />
        </UIFramework.Row>
        <UIFramework.Button
          onClick={() => this.onSubmit()}
          disabled={false}
        >
          复制
        </UIFramework.Button>
      </UIFramework>
      </Spin>
    );
  }
}

export default ClassBatch;
