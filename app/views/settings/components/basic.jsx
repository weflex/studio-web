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
      data: {}
    };
  }
  async componentWillMount() {
    this.setState({
      data: await client.org.getSelectedVenue()
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
          <Row name="组织名称">
            <TextInput 
              bindStateCtx={this}
              bindStateName="data.name" />
          </Row>
          <Row name="首栏图片">
            <TextInput
              bindStateCtx={this}
              bindStateName="data.banner" />
          </Row>
          <Row name="经理">
            <TextInput
              bindStateCtx={this}
              bindStateName="data.manager" />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = Venue;
