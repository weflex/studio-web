"use strict"

import _ from 'lodash';
import React from 'react';
import { DropModal } from 'boron2';
import { UIButton } from 'react-ui-form';
import { UIAvatarImage } from '../../../components/ui-profile';
import { client } from '../../../api';
import InviteTrainerView from '../components/invite-trainer';
import EditTrainerView from '../components/edit-trainer';

let fullname = obj => obj.first + ' ' + obj.last;

class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.editTrainerModals = [];
    this.state = {
      orgmembers    : [],
      venues        : [],
      trainers      : [],
    };
  }
  async componentWillMount() {
    let venue = await client.user.getVenueById();
    let members = await client.orgMember.list({
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
      orgmembers.push(venues[0].owner);
    }

    this.setState({
      orgmembers,
      venues,
      trainers,
    });
  }
  onInviteTrainer() {
    this.refs.inviteTrainerModal.show();
  }
  onTrainerInvited() {
    this.refs.inviteTrainerModal.hide();
    this.refresh();
  }
  onRefEditTrainerModal(index, modal) {
    if (modal) {
      this.editTrainerModals[index] = modal;
    }
  }
  onEditTrainer(index, event) {
    this.editTrainerModals[index].show();
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
                <UIAvatarImage src={member.user.avatar} />
                <span className="username">{fullname(member.fullname)}</span>
              </li>
            );
          })}
        </ul>
        <header>
          <h3>门店店长</h3>
          <UIButton text="创建新门店" disabled={true} title="敬请期待" />
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
                <UIAvatarImage src={venueOwner.user.avatar} />
                <span className="username">
                  {fullname(venueOwner.fullname)}
                </span>
                <span className="venue">{venue.name}</span>
              </li>
            );
          })}
        </ul>
        <header>
          <h3>教练列表</h3>
          <UIButton text="邀请新教练" onClick={this.onInviteTrainer.bind(this)} />
          <DropModal ref="inviteTrainerModal">
            <InviteTrainerView
              onComplete={this.onTrainerInvited.bind(this)}
            />
          </DropModal>
        </header>
        <ul className="settings-team-item settings-team-trainers">
          {this.state.trainers.map((trainer, index) => {
            return (
              <li key={index}>
                <UIAvatarImage src={trainer.user.avatar} />
                <span className="username">{fullname(trainer.fullname)}</span>
                <span className="description">{trainer.description}</span>
                <span className="venue" onClick={this.onEditTrainer.bind(this, index)}>
                  {trainer.venue ? trainer.venue.name : '所有门店'}
                </span>
                <DropModal ref={this.onRefEditTrainerModal.bind(this, index)}>
                  <EditTrainerView
                    data={trainer}
                    onComplete={this.onTrainerEdited.bind(this, index)}
                  />
                </DropModal>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

module.exports = Venue;
