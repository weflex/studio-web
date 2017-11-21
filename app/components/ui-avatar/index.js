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
    const isImage = this.checkFile(file)
    if (!isImage) {
      let dataSource = this.props.dataSource
      await client.user.update(dataSource.userId, {
        avatarId: result.id
      }, '');
      location.href = '/trainer/' + dataSource.id;
    } else {
      alert(isImage)
    }
  }
  checkFile(file, index) {
    const imageType = new Set(['image/png', 'image/jpg', 'image/jpeg', 'image/gif']);
    if (!imageType.has(file.type)) {
      return `文件(${file.name})不是图片格式：.png, .jpg, .jpeg, .gif。`;
    } else if (file.size > 2 * 1024 * 1024) {
      return `文件(${file.name})大小必须小于2M。`;
    }
    return null;
  }
  onError(err) {
    console.error(err);
  }
  checkFileSize(file) {

  }
  render() {
    return (
      // <UIFramework.Image size={70} src={this.props.src} style={{marginRight: '10px'}} />
      <
      UIFramework.Upload token = { this.state.uptoken }
      onSuccess = { this.onAvatarUploaded.bind(this) }
      onError = { this.onError } >
      <
      UIFramework.Cell >
      <
      UIFramework.Button > 上传头像 < /UIFramework.Button> <
      UIFramework.Divider / >
      <
      /UIFramework.Cell> <
      /UIFramework.Upload>
    );
  }
}
module.exports = AvatarUploader
