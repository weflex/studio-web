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

class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venue: {},
      org: {},
    };
  }
  async componentWillMount() {
    const venue = await client.org.getSelectedVenue();
    const org = await client.org.get(venue.orgId);
    this.setState({
      venue, org
    });
  }
  get title() {
    return '场馆设置';
  }
  get actions() {
    return [
      {
        title: '管理场馆'
      },
      {
        title: '邀请教练'
      }
    ]
  }
  render() {
    return (
      <div className="settings-detail settings-basic">
        <Form>
          <Row name="组织名称" required={true}>
            <TextInput 
              bindStateCtx={this}
              bindStateName="org.name"
              bindStateValue={this.state.org.name} />
          </Row>
          <Row name="首栏图片" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="org.banner" />
          </Row>
          <Row name="经理" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="org.manager" />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = Venue;
