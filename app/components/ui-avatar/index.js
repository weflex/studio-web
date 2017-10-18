"use strict"

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';

class AvatarUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uptoken: null,
    };
  }
  async componentWillMount() {
    // const venue = await client.user.getVenueById();
    const token = await client.resource.token();
    this.setState({
      uptoken: token.uptoken,
    });
  }
  async onAvatarUploaded(result, file) {
    let dataSource = this.props.dataSource
    await client.user.update(dataSource.userId, {
      avatarId: result.id
    }, '');
    location.href = '/trainer/'+dataSource.id;
  }
  onError(err) {
    console.error(err);
  }
  render() {
    return (
      // <UIFramework.Image size={70} src={this.props.src} style={{marginRight: '10px'}} />
      <UIFramework.Upload 
        token={this.state.uptoken} 
        onSuccess={this.onAvatarUploaded.bind(this)}
        onError={this.onError}>
        <UIFramework.Cell>
          <UIFramework.Button>上传头像</UIFramework.Button>
          <UIFramework.Divider />
        </UIFramework.Cell>
      </UIFramework.Upload>
    );
  }
}
module.exports =  AvatarUploader