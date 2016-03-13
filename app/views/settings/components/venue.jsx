"use strict"

import React from 'react';
import {
  Form,
  Row,
  TextInput,
  FileInput,
  TextButton,
  Label,
  HintText,
  OptionsPicker
} from '../../../components/form';
import { client } from '../../../api';

class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venue: {},
      owner: {}
    };
  }
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const org = await client.org.get(venue.orgId, {
      include: [
        {
          'members': ['roles']
        },
      ]
    });
    this.setState({
      venue,
      owner: this.getOwner(org.members),
    });
  }
  getOwner(members) {
    let owner;
    for (let member of members) {
      for (let role of member.roles) {
        if (role.name === '$owner') {
          owner = member;
          break;
        }
      }
      if (owner) {
        break;
      }
    }
    owner.display = owner.fullname.first + ' ' + owner.fullname.last;
    return owner;
  }
  async onSubmit() {
    await client.venue.upsert(this.state.venue);
    location.reload();
  }
  render() {
    return (
      <div className="settings-detail settings-venue">
        <Form>
          <Row name="场馆名" required={true}>
            <TextInput 
              bindStateCtx={this}
              bindStateName="venue.name"
              bindStateValue={this.state.venue.name}
            />
          </Row>
          <Row name="联系电话" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="venue.phone"
              bindStateValue={this.state.venue.phone}
            />
          </Row>
          <Row name="地址" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="venue.address"
              bindStateValue={this.state.venue.address}
            />
          </Row>
          <Row name="店长" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateValue={this.state.owner.display}
              disabled={true}
            />
          </Row>
          <Row>
            <TextButton text="保存信息" onClick={this.onSubmit.bind(this)} />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = Venue;
