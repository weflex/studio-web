import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { Table, Button } from 'antd';
import { client } from '../../util/api';
import { Link } from 'react-router';
import TrainerProfile from './profile';
import TrainerSchedule from './schedule';
import { FormattedMessage } from 'react-intl';

class TrainerList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };

    this.cache = {
      venueId: '',
    };

    this.updateTrainerList();
  }

  async updateTrainerList() {
    if (!this.cache.venueId) {
      this.cache.venueId = (await client.user.getVenueById()).id;
    }

    const trainers = await client.collaborator.list({
      where: {
        venueId: this.cache.venueId,
      },
      include: [
        'roles',
        'venue',
        {
          relation: 'ptSchedule',
          scope: {
            where: {
              trashedAt: {
                exists: false,
              },
            },
          },
        },
        {
          'user': ['avatar'],
        },
      ],
    });
    this.setState({
      dataSource: trainers.map((trainer,index) => {
        const name = trainer.fullname.first + trainer.fullname.last;
        const URL = '/trainer/' + trainer.id;
        const defaultAvatar = { uri: 'http://static.theweflex.com/default-avatar-male.png' };
        return {
          key:index,
          id: trainer.id,
          name: <Link onClick={() => mixpanel.track("教练：教练详情")} to={URL}>{name}</Link>,
          phone: trainer.user.phone,
          employmentStatus: trainer.employmentStatus,
          avatar: trainer.user.avatar || defaultAvatar,
          ptSchedule: trainer.ptSchedule,
        };
      })
    });
  }

  // internal functions

  get columns() {
    return [
      {
        dataIndex: 'avatar',
        key: 'avatar',
        title: '',
        render: (avatar) =>
          <img className='avatar' src={avatar.uri} />
      },
      {
        dataIndex: "name",
        title: <FormattedMessage id="studio_web_trainer_management_table_column_name"/>,
        key: 'name',
      },
      {
        dataIndex: "phone",
        title: <FormattedMessage id="studio_web_trainer_management_table_column_phone"/>,
        key: 'phone',
      },
      {
        dataIndex: "employmentStatus",
        title: <FormattedMessage id="studio_web_trainer_management_table_column_employment_status"/>,
        key: 'employmentStatus',
      },
      {
        dataIndex: 'id',
        title: <FormattedMessage id="studio_web_trainer_management_table_column_operation"/>,
        key: 'schedule',
        className: 'action',
        render: (_, trainer) =>
          <Button onClick={() => {
            mixpanel.track("教练：私教排期");
            this.setState({
              ptScheduleModalSchedule: trainer.ptSchedule,
              ptScheduleModalTrainerId: trainer.id,
            });
            this.triggerModal('ptScheduleModal');
          }}><FormattedMessage id="studio_web_trainer_management_table_btn_pvt_schedule"/></Button>
      },
    ];
  }

  // modal callback functions

  dismissModal(refName) {
    this.setState({ [refName + 'Visible']: false });
  }

  onAddTrainerDone() {
    this.updateTrainerList();
    this.setState({ profileModalVisible: false });
  }

  triggerModal(refName) {
    this.setState({ [refName + 'Visible']: true });
  }

  addTrainer(refName) {
    mixpanel.track("教练：添加教练");
    this.setState({ [refName + 'Visible']: true });
  }

  render() {
    return (
      <div className='trainer-list'>
        <Table columns={this.columns}
          dataSource={this.state.dataSource}
          title={() => <h2><FormattedMessage id="studio_web_trainer_management_table_title"/></h2>} />
        <div className='action-button'>
          <UIFramework.Button
            onClick={this.addTrainer.bind(this, 'profileModal')}>
            <FormattedMessage id="studio_web_trainer_management_action_add_trainer"/>
          </UIFramework.Button>
        </div>
        <UIFramework.Modal
          ref="profileModal"
          footer=""
          title={<FormattedMessage id="studio_web_trainer_management_action_add_trainer"/>}
          onCancel={this.dismissModal.bind(this, 'profileModal')}
          visible={this.state.profileModalVisible}>
          <TrainerProfile
            trainer={{}}
            onComplete={this.onAddTrainerDone.bind(this)} />
        </UIFramework.Modal>
        <UIFramework.Modal
          ref="ptScheduleModal"
          footer=""
          title={<FormattedMessage id="studio_web_trainer_management_table_btn_pvt_schedule"/>}
          onCancel={this.dismissModal.bind(this, 'ptScheduleModal')}
          visible={this.state.ptScheduleModalVisible}>
          <TrainerSchedule
            schedule={this.state.ptScheduleModalSchedule}
            trainerId={this.state.ptScheduleModalTrainerId}
            onComplete={
              (ptSchedule) => {
                let dataSource = this.state.dataSource
                let index = dataSource.findIndex((element)=>{
                   return element.id == ptSchedule.trainerId
                })
                if(index = -1) {
                    index = 0
                }
                dataSource[index].ptSchedule = ptSchedule
                this.setState({
                  ptScheduleModalVisible: false,
                  dataSource,
                })
              }} />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = TrainerList;
