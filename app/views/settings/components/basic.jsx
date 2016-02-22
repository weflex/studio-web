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
  checkBanner(file) {
    console.log(file.type);
    if (file.type !== 'image/png' &&
      file.type !== 'image/jpg' &&
      file.type !== 'image/jpeg' &&
      file.type !== 'image/gif') {
      let err = new TypeError('image required');
      err.displayMessage = '必须选择图片';
      return err;
    }
    if (file.size > 2*1024*1024) {
      let err = new Error('image size should less than 2M');
      err.displayMessage = '图片大小必须小于2M'
    }
    return null;
  }
  render() {
    return (
      <div className="settings-detail settings-basic">
        <Form>
          <Row name="组织名称" required={true}>
            <TextInput 
              bindStateCtx={this}
              bindStateName="org.name"
              bindStateValue={this.state.org.name} 
            />
          </Row>
          <Row name="首栏图片" required={true}>
            <FileInput
              bindStateCtx={this}
              bindStateName="org.banner"
              checkFile={this.checkBanner.bind(this)}
            />
          </Row>
          <Row name="经理" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="org.manager" 
            />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = Venue;
