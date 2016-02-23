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
      venue: {
        administrator: {
          username: '...'
        }
      }
    };
  }
  async componentWillMount() {
    const id = (await client.org.getSelectedVenue()).id;
    const venue = await client.venue.get(id, {
      include: ['administrator']
    });
    this.setState({venue});
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
              bindStateName="venue.address"
              bindStateValue={this.state.venue.administrator.username}
              disabled={true}
            />
          </Row>
          <Row name="场景图片">
            <FileInput
              bindStateCtx={this}
              bindStateName="venue.photos"
              multiple={true}
            />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = Venue;
