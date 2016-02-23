"use strict"

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
      orgAdmin: null,
      venues: [],
      trainers: [],
    };
  }
  async componentWillMount() {
    const id = (await client.org.getSelectedVenue()).orgId;
    const org = await client.org.get(id, {
      include: {
        venues: 'administrator'
      }
    });
    const orgAdmin = await client.user.get(org.administratorId);
    const venues = org.venues;
    const trainers = await client.trainer.list({
      where: { 
        orgId: id 
      },
      include: ['user', 'venue']
    });
    this.setState({
      orgAdmin,
      venues,
      trainers
    });
  }
  render() {
    return (
      <div className="settings-detail settings-team">
        <header>
          <h3>组织</h3>
        </header>
        <ul className="settings-team-trainers">
          {([this.state.orgAdmin]).map((user, index) => {
            if (!user) {
              return;
            }
            return (
              <li key={index}>
                <img src={user.avatar.uri} />
                <span className="username">{user.username}</span>
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
            return (
              <li key={index}>
                <img src={venue.administrator.avatar.uri} />
                <span className="username">{venue.administrator.username}</span>
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
                <span className="venue">{trainer.venue.name}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

module.exports = Venue;
