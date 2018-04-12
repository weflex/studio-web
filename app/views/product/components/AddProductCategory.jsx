import React from 'react'
import { Modal, Button, Row, Col, Input } from 'antd';

class AddProductCagtegory extends React.Component {
  state = {
    visible: false,
    name: 'productCategorys',
    newItem: {

    }
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = () => {
    const addOne = this.props.addOne
    const { newItem, name } = this.state
    if (typeof addOne == 'function') {
      addOne(name, newItem)
    }
    this.setState({ visible: false });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  render() {
    const { visible } = this.state
    return (
      <div style={this.props.style}>
        <Button onClick={this.showModal}>{this.props.buttonName}</Button>
        <Modal
          visible={visible}
          title="创建新分类"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Row style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>分类名称</Col>
            <Col span={12}><Input placeholder="分类名称" onChange={(e) => {
              this.setState({
                newItem: {
                  id: Math.floor(Math.random()*1000 + 1),
                  name: e.target.value,
                  createdAt: (new Date()).toLocaleString(),
                  createdBy: 'ALEX',
                }
              })
            }} /></Col>
          </Row>
        </Modal>
      </div>
    )
  }
}

module.exports = AddProductCagtegory