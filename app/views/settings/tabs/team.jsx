"use strict"

import _ from 'lodash';
import React from 'react';
import UIFramework from 'weflex-ui';
import InviteTrainerView from '../components/invite-trainer';
import EditTrainerView from '../components/edit-trainer';
import { client } from '../../../api';

let fullname = obj => obj.first + ' ' + obj.last;

/**
 * @class TrainesrManager
 */
class TrainersManager extends React.Component {
  static propTypes = {
    /**
     * @property {Array} trainers - the trainers
     */
    trainers: React.PropTypes.array,
    /**
     * @property {Object} context - the context object
     */
    context: React.PropTypes.any,
  };
  static defaultProps = {
    trainers: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      inviteModalVisibled: false,
    };
  }
  onClickInviteModal() {
    this.setState({
      inviteModalVisibled: true,
    });
  }
  onCloseInviteModal() {
    this.setState({
      inviteModalVisibled: false,
    });
  }
  onInviteDone() {
    this.props.context.refresh();
  }
  render() {
    return (
      <div>
        <header>
          <h3>教练列表</h3>
          <UIFramework.Button 
            text="邀请新教练" 
            align="right"
            onClick={this.onClickInviteModal.bind(this)}
          />
          <UIFramework.Modal
            title="邀请新教练"
            footer=""
            onCancel={this.onCloseInviteModal.bind(this)}
            visible={this.state.inviteModalVisibled}>
            <InviteTrainerView
              onComplete={this.onInviteDone.bind(this)}
            />
          </UIFramework.Modal>
        </header>
        <ul className="settings-team-item settings-team-trainers">
          {this.props.trainers.map((trainer, index) => {
            return (
              <TrainerBox
                key={index} 
                data={trainer} 
                context={this.props.context} 
              />
            );
          })}
        </ul>
      </div>
    );
  }
}

/**
 * @class TrainerBox
 */
class TrainerBox extends React.Component {
  static propTypes = {
    /**
     * @property {Object} data - the trainer data
     */
    data: React.PropTypes.object,
    /**
     * @property {Object} context - the context object
     */
    context: React.PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      modalVisibled: false,
    };
  }
  onClickEditModal() {
    this.setState({
      modalVisibled: true,
    });
  }
  onCloseEditModal() {
    this.setState({
      modalVisibled: false,
    });
  }
  onEditDone() {
    this.props.context.refresh();
  }
  render() {
    let trainer = this.props.data;
    return (
      <li title={trainer.description}>
        <UIFramework.Image src={trainer.user.avatar} style={{}} size={30} />
        <span className="username">{fullname(trainer.fullname)}</span>
        <span className="description">{trainer.venue ? trainer.venue.name : '所有门店'}</span>
        <span className="button" onClick={this.onClickEditModal.bind(this)}>编辑教练信息</span>
        <UIFramework.Modal
          footer=""
          visible={this.state.modalVisibled}
          onCancel={this.onCloseEditModal.bind(this)}>
          <EditTrainerView
            data={trainer}
            onComplete={this.onEditDone.bind(this)}
          />
        </UIFramework.Modal>
      </li>
    );
  }
}

class Team extends React.Component {
  constructor(props) {
    super(props);
    this.editTrainerModals = [];
    this.state = {
      inviteTrainerVisible: false,
      editTrainerVisible: false,
      orgmembers: [],
      venues: [],
      trainers: [],
    };
  }
  async componentWillMount() {
    let venue = await client.user.getVenueById();
    let members = await client.collaborator.list({
      where: {
        or: [
          {orgId: venue.orgId},
          {venueId: venue.id}
        ]
      },
      include: [
        'roles',
        'venue',
        {
          'user': ['avatar']
        }
      ]
    });
    let orgmembers = [];
    let trainers = [];
    let venues = await client.venue.list({
      where: {
        orgId: venue.orgId
      },
    });

    for (let member of members) {
      for (let role of member.roles) {
        switch (role.name) {
          case '$owner':
            if (!member.venueId) {
              orgmembers.push(Object.assign({
                isOwner: true
              }, member));
            } else {
              const venue = _.find(venues, {
                id: member.venueId,
              });
              venue.owner = member;
            }
            break;
          case '$admin':
            if (!member.venueId) {
              orgmembers.push(Object.assign({
                isOwner: false
              }, member));
            } else {
              const venue = _.find(venues, {
                id: member.venueId,
              });
              if (!Array.isArray(venue.admin)) {
                venue.admin = [];
              }
              venue.admin.push(member);
            }
            break;
          case 'trainer':
            trainers.push(member);
            break;
        }
      }
    }
    if (orgmembers.length === 0) {
      const currVenue = _.find(venues, {id: venue.id});
      orgmembers.push(Object.assign({
        isOwner: true,
      }, currVenue.owner));
    }
    this.setState({
      orgmembers,
      venues,
      trainers,
    });
  }
  onTrainerInvited() {
    this.setState({
      inviteTrainerVisible: false,
    });
    this.refresh();
  }
  onTrainerEdited(index, event) {
    this.editTrainerModals[index].hide();
    this.refresh();
  }
  refresh() {
    setTimeout(() => {
      this.props.updateMaster();
    }, 0);
  }
  render() {
    return (
      <div className="settings-detail settings-team">
        <header>
          <h3>组织</h3>
        </header>
        <ul className="settings-team-item settings-team-org">
          {(this.state.orgmembers).map((member, index) => {
            return (
              <li key={index}>
                <UIFramework.Image src={member.user.avatar} style={{}} size={30} />
                <span className="username">{fullname(member.fullname)}</span>
              </li>
            );
          })}
        </ul>
        <header>
          <h3>门店店长</h3>
          <UIFramework.Button 
            text="创建新门店" 
            disabled={true} 
            align="right" 
            title="敬请期待" 
          />
        </header>
        <ul className="settings-team-item settings-team-venues">
          {this.state.venues.map((venue, index) => {
            let venueOwner;
            if (!venue.owner) {
              venueOwner = _.find(this.state.orgmembers, {isOwner: true});
            } else {
              venueOwner = venue.owner;
            }
            return (
              <li key={index}>
                <UIFramework.Image src={venueOwner.user.avatar} style={{}} size={30} />
                <span className="username">
                  {fullname(venueOwner.fullname)}
                </span>
                <span className="venue">{venue.name}</span>
              </li>
            );
          })}
        </ul>
        <TrainersManager trainers={this.state.trainers} context={this} />
      </div>
    );
  }
}

module.exports = Team;
