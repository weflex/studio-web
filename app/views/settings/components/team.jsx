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
      trainers: []
    };
  }
  async componentWillMount() {
    const orgId = (await client.org.getSelectedVenue()).orgId;
    const trainers = await client.trainer.list({
      where: { orgId },
      include: ['user', 'venue']
    });
    this.setState({trainers});
  }
  render() {
    return (
      <div className="settings-detail settings-team">
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
