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
      <div className="settings-detail settings-venue">
        <Form>
          <Row name="场馆名" required={true}>
            <TextInput 
              bindStateCtx={this}
              bindStateName="data.name"
            />
          </Row>
          <Row name="联系电话" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="data.phone"
            />
          </Row>
          <Row name="地址" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="data.address"
            />
          </Row>
          <Row name="店长" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="data.address"
            />
          </Row>
          <Row name="场景图片">
            <TextInput
              multiline={true}
              bindStateCtx={this}
              bindStateName="data.address"
            />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = Venue;
