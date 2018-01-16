import './index.css';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Calendar from './calendar';
import _ from 'lodash';
import { WeekPicker } from './components/week-picker';
import { getCellHeight, getFormatTime } from './util';
import UIFramework from '@weflex/weflex-ui';
import ClassBatch from './ClassBatch';
import ClassList from './class-list';
import Template from './components/template';
import ResourcePanel from '../../components/resource-panel';
import moment from 'moment';
import hourminute from '@weflex/hourminute';
import { client } from '../../util/api';
import * as actions from '../../actions';
import { injectIntl, intlShape } from 'react-intl';

/**
 * @class WeflexCalendar
 * @extends React.Component
 */
class WeflexCalendar extends React.Component {
  constructor(props, context) {
    super(props, context);
    moment.locale('zh-cn');
    this.cards = [];
    this.state = {
      schedule: new ClassList(),
      modalVisibled: false,
    };
  }

  get title() {
    return null;
    /*(
      <WeekPicker context={this} />
    );*/
  }

  get actions() {
    const { intl } = this.props;
    return [
      {
        title: intl.formatMessage({id: 'studio_web_calendar_actions_batch_scheduling'}),
        onClick: (ctx, action) => {
          this.setState({modalVisibled: true});
          const calendar = this.refs.calendar;
          calendar.setState({isEditing: false});
          // hide the resource firstly.
          //== mixpanel.track( "日历：管理课程/完成");
        }
      },
      {
        title: intl.formatMessage({id: 'studio_web_calendar_actions_manage_course'}),
        toggledTitle: intl.formatMessage({id: 'studio_web_calendar_actions_manage_course_complete'}),
        onClick: (ctx, action) => {
          // hide the resource firstly.
          ctx.resource.hide();
          // FIXME(Yorkie): move the below code to calendar?
          const calendar = this.refs.calendar;
          const isEditing = !calendar.state.isEditing;
          calendar.setState({isEditing});
          mixpanel.track( "日历：管理课程/完成");
        }
      },
      {
        title: intl.formatMessage({id: 'studio_web_calendar_template_add_course'}),
        onClick: (ctx) => {
          const calendar = this.refs.calendar;
          calendar.setState({isEditing: false});
          ctx.resource.toggle();
          mixpanel.track( "日历：添加课程");
        }
      }
    ];
  }

  get resource() {
    const { intl } = this.props;
    const actions = [
      {
        title: intl.formatMessage({id: 'studio_web_calendar_resources_add_template'}),
        path: '/class/template/add'
      },
      {
        title: intl.formatMessage({id: 'studio_web_calendar_resources_manage_template'}),
        path: '/class/template'
      }
    ];
    const getData = () => {
      return this.props.classTemplateAction.getClassTemplateList(['trainer']);
    };

    return (
      <ResourcePanel component={Template}
        context={{
          actions,
          calendar: this.refs.calendar,
          onRelease: (newClass) => this.createClass(newClass)
        }}
        getData={getData}
      />
    );
  }

  render() {
    const { intl } = this.props;
    const cellHeight = getCellHeight();
    const { schedule, modalVisibled } = this.state;
    return (
      <div>
        <Calendar ref="calendar"
                  ctx={this}
                  cellHeight={cellHeight}
                  schedule={schedule} />
        <UIFramework.Modal
          title={ intl.formatMessage({id: 'studio_web_calendar_actions_batch_scheduling'}) }
          footer=""
          visible={ modalVisibled }
          onCancel={ () => this.setState({modalVisibled: false}) }
        >
          <ClassBatch schedule={ schedule._list } refs={this.refs} onComplete={ (startsAt,endsAt) => {this.setState({modalVisibled: false});this.listClasses(startsAt,endsAt) }} />
        </UIFramework.Modal>
      </div>
    );
  }

  // MARK: - CalendarContext methods

  get viewDate () {
    return this.refs.calendar.state.viewDate;
  }

  get viewMode () {
    return this.refs.calendar.state.viewMode;
  }

  setViewDate (viewDate) {
    this.refs.calendar.setViewDate(viewDate);
    // TODO: avoid calling setState() outside component
    const startOfWeek = moment(this.viewDate).startOf('week');
    const week = _.range(0, 7).map((n) => moment(startOfWeek).add(n, 'days'));
    const indexes = week.map((d) => {
      return {
        raw: d,
        content: d.format('ddd DD')
      };
    });
    this.refs.calendar.setState({indexes});
  }

  // MARK: - CalendarDataSource methods

  async listClasses(startsAt, endsAt) {
    const venue = this.props.venueAction.getVenueById();
    const data = {
      startsAt: startsAt,
      endsAt: endsAt,
      venue: venue,
    };
    const classList = await this.props.classAction.getClassList(data);
    const classes = classList.map( (item) => {
      const startsAt = moment(item.startsAt);
      const endsAt = moment(item.endsAt);
      item.date = moment(startsAt).startOf('day');
      item.from = hourminute({hour: startsAt.hour(), minute: startsAt.minute()});
      item.to = hourminute({hour: endsAt.hour(), minute: endsAt.minute()});
      item.type = 'class';
      return item;
    });

    const ptSessions = await this.props.classAction.getPtSessions(data);
    const ptSessionAsClasses = ptSessions.map((session) => {
      const startsAt = moment(session.startsAt);
      const endsAt = moment(startsAt).add(session.durationMinutes, 'minutes');
      const trainerName = session.trainer.fullname.first + session.trainer.fullname.last;
      return {
        template: {
          name: '私教 (' + trainerName + ')',
        },
        trainer: session.trainer,
        date: moment(startsAt).startOf('day'),
        from: hourminute({hour: startsAt.hour(), minute: startsAt.minute()}),
        to: hourminute({hour: endsAt.hour(), minute: endsAt.minute()}),
        orders: [Object.assign(session, {isPT: true})],
        isPT: true,
        type: 'ptSessions',
      };
    });

    const schedule = new ClassList(classes.concat(ptSessionAsClasses));
    this.setState({schedule});
  }

  async updateClass(classUpdates) {
    const { intl } = this.props;
    const etag = classUpdates.modifiedAt;
    const schedule = this.state.schedule;
    const classId = classUpdates.id;
    let results;
    schedule.removeItemById(classId);
    this.setState({schedule});
    try {
      results = await client.class.update(classId, classUpdates, etag);
    } catch (err) {
      UIFramework.Message.error(intl.formatMessage({id: 'studio_web_calendar_modal_update_class_error'}));
      console.error(err);
    } finally {
      classUpdates = Object.assign({}, classUpdates, results);
      schedule.addItem(classUpdates);
      this.setState({schedule});
    }
  }

  async deleteClass(classDeletes) {
    const { intl } = this.props;
    const className = classDeletes.template.name;
    const schedule = this.state.schedule;
    const setState = this.setState.bind(this);
    const etag = classDeletes.modifiedAt;
    const modalTitle = intl.formatMessage({id: 'studio_web_calendar_modal_confirm_delete_title'});
    const modalContent = intl.formatMessage({id: 'studio_web_calendar_modal_confirm_delete_content'});
    UIFramework.Modal.confirm({
      title: `${modalTitle + className}”？`,
      content: `${modalContent + className}”？`,
      onOk: async () => {
        schedule.removeItemById(classDeletes.id);
        setState({schedule});
        try {
          await client.class.delete(classDeletes.id, etag);
        } catch (err) {
          UIFramework.Message.error(intl.formatMessage({id: 'studio_web_calendar_modal_delete_class_error'}));
          console.error(err);
        }
      }
    });
  }

  async createClass(newClass) {
    const { intl } = this.props;
    const tempId = Math.random().toString(36).slice(2); // alpha-numeric random string
    const dupClass = Object.assign({}, newClass, {id: tempId}); // duplicate class to avoid contaminating remote data
    const schedule = this.state.schedule;
    schedule.addItem(dupClass);
    let results;
    this.setState({schedule}, async () => {
      try {
        results = await client.class.create(newClass);
      } catch (err) {
        UIFramework.Message.error(intl.formatMessage({id: 'studio_web_calendar_modal_create_class_error'}));
        console.error(err);
      } finally {
        schedule.removeItemById(tempId);
        newClass = Object.assign({}, newClass, results);
        schedule.addItem(newClass);
        this.setState({schedule});
      }
    });
  }
}

WeflexCalendar.propTypes = {
  userAction: PropTypes.object.isRequired,
  venueAction: PropTypes.object.isRequired,
  classTemplateAction: PropTypes.object.isRequired,
  classAction : PropTypes.object.isRequired,
  intl: intlShape.isRequired,
}

WeflexCalendar.contextTypes = {
  router: PropTypes.object
}

function mapStateToProps(state){
  return {

  };
}

function mapDispatchToProps(dispatch) {
  return {
    userAction: bindActionCreators(actions.userAction, dispatch),
    venueAction: bindActionCreators(actions.venueAction, dispatch),
    classTemplateAction: bindActionCreators(actions.classTemplateAction, dispatch),
    classAction: bindActionCreators(actions.classAction, dispatch),
  };
}

module.exports = injectIntl(connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(WeflexCalendar), { withRef: true });
