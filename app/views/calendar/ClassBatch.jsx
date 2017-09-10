import './index.css';
import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';
import { Select, Button, Table, DatePicker } from 'antd';
import { keyBy, sortBy, findIndex } from 'lodash';
import { startOfWeek, endOfWeek, addDays, addMinutes, format, differenceInDays, setHours, setMinutes } from 'date-fns';
import classnames from 'classnames';
import moment from 'moment';

class ClassBatch extends React.Component {

  static propTypes = {
    
  };

  constructor(props) {
    super(props);

    this.state = {
      weekStartsAt: moment().startOf('week'),
      courseTemplates: {},
      scheduleIndex: 1,
      schedule: [ [], [], [], [], [], [], [] ],
      time: '09:00',
      templateId: '',
    }

    this.cache = {
      venueId: '',
      weekStartsOn: 1,
      dateFormat: 'YYYY-MM-DD',
      columns: [
        {
          title: '时间',
          dataIndex: 'Time',
          key: 'Time',
          width: '25%',
        }, {
          title: '课程名称',
          dataIndex: 'CourseName',
          key: 'CourseName',
          width: '30%',
        }, {
          title: '教练姓名',
          dataIndex: 'TrainerName',
          key: 'TrainerName',
          width: '30%',
        }, {
          title: '操作',
          dataIndex: 'Operation',
          key: 'Operation',
          width: '15%',
        }
      ],
    }

    this.onAddTemplate = this.onAddTemplate.bind(this);
    this.onDeleteTemplate = this.onDeleteTemplate.bind(this);
  }

  async componentDidMount() {
    this.cache.venueId = (await client.user.getVenueById()).id;

    const courseTemplates = await this.getCourseTemplates();
    const schedule = await this.getCourseTemplatesConfig();

    this.setState({
      courseTemplates,
      schedule,
    });
  }

  async componentWillReceiveProps(nextProps) {
    // const courseTemplates = await this.getCourseTemplates();

    // this.setState({
    //   courseTemplates,

    // });
  }

  async getCourseTemplates() {
    const { venueId } = this.cache;

    const classTemplates = await client.classTemplate.list({
      where: {
        venueId,
      },
      include: 'trainer',
    });

    return keyBy(classTemplates, 'id');
  }

  async getCourseTemplatesConfig() {
    const { venueId } = this.cache;
    const courseTemplates = [[], [], [], [], [], [], []] || await client.classTempleList.list({
      where: venueId,
    });

    return courseTemplates
  }

  onAddTemplate() {
    const { schedule, scheduleIndex, time, templateId } = this.state;

    if(!time || !templateId){
      return;
    }

    schedule[scheduleIndex].push({time, templateId});
    schedule[scheduleIndex] = sortBy(schedule[scheduleIndex], ['time'])
    this.saveCourseTemplate(schedule);
    
  }

  onDeleteTemplate(time, templateId) {
    const { schedule, scheduleIndex } = this.state;
    schedule[scheduleIndex].splice(findIndex(schedule[scheduleIndex], {time, templateId}), 1);
    this.saveCourseTemplate(schedule);
  }

  async saveCourseTemplate(schedule) {

    this.setState({ schedule });
  }

  getScheduleView() {
    const { schedule, scheduleIndex, courseTemplates } = this.state;
    const scheduleView = [];

    schedule[scheduleIndex].forEach(item => {
      const template = courseTemplates[item.templateId];

      if(template) {
        const { first, last } = template.trainer.fullname;
        scheduleView.push({
          key: item.id,
          Time: getEndsAt(item.time, template.duration),
          CourseName: template.name,
          TrainerName: `${first} ${last}`,
          Operation: <span style={{color: '#FF8AC2', cursor:'pointer'}} onClick={e => this.onDeleteTemplate(item.time, item.templateId)}>删除</span>
        });
      }
    });

    function getEndsAt(time, duration) {
      const times = time.split(':');
      const minutes = 60 * Number(times[0]) + Number(times[1]) + duration;

      return `${time} ~ ${ it(Math.floor(minutes / 60)) }:${it(minutes % 60)}`;
    }

    function it(number) {
      return (number < 10)? '0'+number: number;
    }

    return scheduleView;
  }

  getCourses() {
    const { weekStartsAt, courseTemplates, schedule } = this.state;
    const { dateFormat } = this.cache;

    const weekStart = weekStartsAt.format(dateFormat);
    const courses = [];

    [1, 2, 3, 4, 5, 6, 0].forEach( (item, i) => {
      const date = addDays(weekStart, i);
      schedule[item].forEach((scheduleItem, j) => {
        const { templateId, time } = scheduleItem;
        const { coverId, description, duration, name, paymentOptionIds, photoIds, price, spot, trainerId, venueId } = courseTemplates[templateId];

        const times = time.split(':');
        const startsAt = setHours(setMinutes(date, times[1]), times[0]);

        courses.push({
          startsAt,
          endsAt: addMinutes(startsAt, duration),
          description,
          duration,
          name,
          paymentOptionIds,
          price,
          spot,
          templateId,
          trainerId,
          venueId,
          orders: [],
        });
      });
    });

    return courses;
  }

  async onSubmit() {
    const courses = this.getCourses();

    try {
      for(let item of courses) {
        await client.class.create({...item});
      }

      this.setState({weekStartsAt: moment().startOf('week') });
      this.props.onComplete();
    } catch (error) {
      console.error(error);
    }
  }

  renderCourseTemplates(courseTemplates) {
    const selects = [];

    for(let key in courseTemplates) {
      const item = courseTemplates[key];
      selects.push(<Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>);
    }

    return (
      <Select
        size="small"
        className="course-templates"
        showSearch
        placeholder="选择课程模板"
        optionFilterProp="children"
        onChange={ value => this.setState({templateId: value}) }
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      >
        { selects }
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

  render() {
    const { weekStartsAt, schedule, scheduleIndex, courseTemplates, time } = this.state;
    const { columns, weekStartsOn, dateFormat } = this.cache;

    return (
      <UIFramework className='course-schedule'>

        <UIFramework.Row name="创建复制模板">
          <div style={{marginBottom: '5px'}}>
            { this.renderSchedule() }
          </div>
          <Table
            columns={columns}
            dataSource={this.getScheduleView()}
            pagination={false}
            scroll={{ y: 240 }}
            footer={ () => 
              <div>
                <UIFramework.TimeInput
                  flex={0.27}
                  style={{height: '22px'}}
                  bindStateCtx={this}
                  bindStateName="time"
                  value={this.state.time}
                  onChange={()=>{}}
                />
                {this.renderCourseTemplates(courseTemplates)}
                <Button size="small" onClick={this.onAddTemplate}>添加</Button>
              </div>
            }
          />
        </UIFramework.Row>

        <UIFramework.Row name="选择复制时间" hint="时间周期为一周，开始时间为周一。">
          <DatePicker
            className="small"
            value={weekStartsAt}
            onChange={ (date, dateString)=>{ if(date) this.setState({weekStartsAt: date })} }
            disabledDate={current => current && current.format('d') !== '1'}
          />
          <DatePicker
            className="small ml10"
            disabled
            value={moment( endOfWeek(weekStartsAt.format(dateFormat), {weekStartsOn}) )}
          />
        </UIFramework.Row>

        <UIFramework.Button
          onClick={() => this.onSubmit()}
          disabled={ false }
        >
          复制
        </UIFramework.Button>
      </UIFramework>
    );
  }
}

export default ClassBatch;
