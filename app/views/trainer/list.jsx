import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { Table, Button, Switch } from 'antd';
import { client } from '../../api';
import { Link } from 'react-router-component';
import TrainerProfile from './profile';
import TrainerSchedule from './schedule';

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
      dataSource: trainers.map((trainer, index) => {
        const name = trainer.fullname.first + trainer.fullname.last;
        const URL = '/trainer/' + trainer.id;
        const defaultAvatar = { uri: 'http://static.theweflex.com/default-avatar-male.png' };
        return {
          key: index,
          id: trainer.id,
          name: <Link href={URL}>{name}</Link>,
          phone: trainer.user.phone,
          employmentStatus: trainer.employmentStatus,
          avatar: trainer.user.avatar || defaultAvatar,
          ptSchedule: trainer.ptSchedule,
          classSms: trainer.classSms,
          modifiedAt: trainer.modifiedAt
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
        title: "教练名字",
        key: 'name',
      },
      {
        dataIndex: "phone",
        title: "联系方式",
        key: 'phone',
      },
      {
        dataIndex: "employmentStatus",
        title: "教练身份",
        key: 'employmentStatus',
      },
      {
        dataIndex: 'id',
        title: '操作',
        key: 'schedule',
        className: 'action',
        render: (_, trainer) =>
          <Button onClick={() => {
            this.setState({
              ptScheduleModalSchedule: trainer.ptSchedule,
              ptScheduleModalTrainerId: trainer.id,
            });
            this.triggerModal('ptScheduleModal');
          }}>私教排期</Button>
      },
      {
        dataIndex: 'classSms',
        title: '团课短信通知',
        key: 'classSms',
        className: 'action',
        render:  (_, trainer) =>
          <Switch checkedChildren="开" unCheckedChildren="关" checked={trainer.classSms} onChange={async () => {
            let dataSource = this.state.dataSource
           const result = await client.collaborator.request(
             trainer.id, 
             'PATCH',
             {
              classSms: !trainer.classSms
            });
            dataSource[trainer.key].classSms = !trainer.classSms
            dataSource[trainer.key].modifiedAt = result.modifiedAt
            this.setState({
              dataSource
            })
          }} />
      }
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
    this.setState({ [refName + 'Visible']: true });
  }

  render() {
    return (
      <div className='trainer-list'>
        <Table columns={this.columns}
          dataSource={this.state.dataSource}
          title={() => <h2>教练</h2>} />
        <div className='action-button'>
          <UIFramework.Button
            onClick={this.addTrainer.bind(this, 'profileModal')} >
            添加教练
          </UIFramework.Button>
        </div>
        <UIFramework.Modal
          ref="profileModal"
          footer=""
          title='添加教练'
          onCancel={this.dismissModal.bind(this, 'profileModal')}
          visible={this.state.profileModalVisible}>
          <TrainerProfile
            trainer={{}}
            onComplete={this.onAddTrainerDone.bind(this)} />
        </UIFramework.Modal>
        <UIFramework.Modal
          ref="ptScheduleModal"
          footer=""
          title='私教排期'
          onCancel={this.dismissModal.bind(this, 'ptScheduleModal')}
          visible={this.state.ptScheduleModalVisible}>
          <TrainerSchedule
            schedule={this.state.ptScheduleModalSchedule}
            trainerId={this.state.ptScheduleModalTrainerId}
            onComplete={
              (ptSchedule) => {
                let dataSource = this.state.dataSource
                let index = dataSource.findIndex((element) => {
                  return element.id == ptSchedule.trainerId
                })
                if (index = -1) {
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
