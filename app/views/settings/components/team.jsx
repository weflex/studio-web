"use strict"

import _ from 'lodash';
import React from 'react';
import {
  Form,
  Row,
  TextInput,
  TextButton,
  Label,
  HintText,
  OptionsPicker
} from '../../../components/form';
import { client } from '../../../api';

let fullname = obj => obj.first + ' ' + obj.last;

class Venue extends React.Component {
  constructor(props) {
    super(props);
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
    this.setState({
      orgmembers,
      venues,
      trainers,
    });
  }
  render() {
    return (
      <div className="settings-detail settings-team">
        <header>
          <h3>组织</h3>
        </header>
        <ul className="settings-team-trainers">
          {(this.state.orgmembers).map((member, index) => {
            console.log(member.user.avatar.uri);
            return (
              <li key={index}>
                <img src={member.user.avatar.uri} />
                <span className="username">{member.user.username}</span>
              </li>
            );
          })}
        </ul>
        <header>
          <h3>门店店长</h3>
          <TextButton text="创建新门店" />
        </header>
        <ul className="settings-team-trainers">
          {this.state.venues.map((venue, index) => {
            let venueOwner;
            if (!venue.owner) {
              venueOwner = _.find(this.state.orgmembers, {isOwner: true});
            } else {
              venueOwner = venue.owner;
            }
            return (
              <li key={index}>
                <img src={venueOwner.user.avatar.uri} />
                <span className="username">
                  {venueOwner.fullname.first} {venueOwner.fullname.first}
                </span>
                <span className="venue">{venue.name}</span>
              </li>
            );
          })}
        </ul>
        <header>
          <h3>教练列表</h3>
          <TextButton text="邀请新教练" />
        </header>
        <ul className="settings-team-trainers">
          {this.state.trainers.map((trainer, index) => {
            return (
              <li key={index}>
                <img src={trainer.user.avatar.uri} />
                <span className="username">{fullname(trainer.fullname)}</span>
                <span className="description">{trainer.description}</span>
                <span className="venue">
                  {trainer.venue ? trainer.venue.name : '所有门店'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

module.exports = Venue;
