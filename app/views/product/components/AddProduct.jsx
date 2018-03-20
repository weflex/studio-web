import React, { Component } from 'react';
import { Modal, Button, Upload, Icon, message, Row, Col, Input } from 'antd';
// import { Avatar } from './Avatar'
import { client } from '../../../api';
import './AddProduct.css'
class AddProduct extends React.Component {
  state = { visible: false }

  async componentWillMount() {
    // const venue = await client.user.getVenueById();
    const token = await client.resource.token();
    this.setState({
      token: token.uptoken
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = (e) => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  }

  handleChange = (info) => {
    console.log(info)
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
    }
    this.getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
  }

  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  beforeUpload(file) {
    const isImage = new Set(['image/png', 'image/jpg', 'image/jpeg', 'image/gif']);
    let isJPG = true
    if (!isImage.has(file.type)) {
      message.error(`文件(${file.name})不是图片格式：.png, .jpg, .jpeg, .gif。`);
      isJPG = false
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(`文件(${file.name})大小必须小于2M。`);
    } else {
      this.setState({
        size: file.size,
      });
    }
  }

  render() {
    const imageUrl = this.state.imageUrl;
    let uploadData = {
      'token': this.state.token,
      'x:size': this.state.size,
    }
    return (
      <div style={this.props.style}>
        <Button onClick={this.showModal}>{this.props.buttonName}</Button>
        <Modal
          title="创建新产品"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={400}
        >
          <Row>
            <Col span={6} style={{ padding: '10px', fontSize: '13px' }}>产品图片</Col>
            <Col span={12} style={{ padding: '10px', fontSize: '13px' }}>
              <Upload
                className="avatar-uploader"
                listType='text'
                data={uploadData}
                showUploadList={false}
                action="http://upload.qiniu.com/"
                beforeUpload={this.beforeUpload.bind(this)}
                onChange={this.handleChange.bind(this)}
              >
                {
                  imageUrl ?
                    <img src={imageUrl} alt="" className="avatar-product" /> :
                    <Icon type="plus" className="avatar-uploader-trigger" />
                }
              </Upload>
            </Col>
          </Row>
          <Row style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>产品名称</Col>
            <Col span={12}><Input placeholder="产品名称" /></Col>
          </Row>
          <Row style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>产品价格</Col>
            <Col span={12}><Input addonAfter={<Icon type="pay-circle" />} placeholder="产品价格" /></Col>
          </Row>
          {/* <p>Some contents...</p>
          <p>Some contents...</p> */}
        </Modal>
      </div>
    );
  }
}

module.exports = AddProduct