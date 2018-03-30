import React from 'react'
import { Modal, Button, Row, Col, Input, Select } from 'antd';
const Option = Select.Option;
const config = [
  {
    id:'1',
    name:'减免折扣'
  },
  {
    id:'2',
    name:'百分比折扣'
  },
  {
    id:'3',
    name:'赠品折扣'
  },
  {
    id:'4',
    name:'量贩满减'
  },
  {
    id:'5',
    name:'量贩打折'
  },
  {
    id:'6',
    name:'会员折扣'
  },
  {
    id:'7',
    name:'满额打折'
  },
  {
    id:'8',
    name:'满额减免'
  },
  {
    id:'9',
    name:'捆绑打折'
  },
  {
    id:'10',
    name:'捆绑减免'
  },
  {
    id:'11',
    name:'团购'
  },
]
class AddDiscount extends React.Component {
  state = {
    visible: false,
    name: 'discounts',
    value: '0',
    newItem: {}
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


  createNewDiscount(){
   
  }

  createDiscount() {
    const value = this.state.value
    switch (value) {
      case '1':
        return ([
          <Row key='1' style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>折扣价格</Col>
            <Col span={12}>
              <Input placeholder="折扣名称" onChange={(e) => {
                this.setState({
                  newItem: {
                    id: Math.floor(Math.random() * 1000 + 1),
                    name: e.target.value,
                    createdAt: (new Date()).toLocaleString(),
                    createdBy: 'ALEX',
                  }
                })
              }} />
            </Col>
          </Row>,
          <Row key='2' style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>选择会员</Col>
            <Col span={12}>
              <Input placeholder="折扣名称" onChange={(e) => {
                this.setState({
                  newItem: {
                    id: Math.floor(Math.random() * 1000 + 1),
                    name: e.target.value,
                    createdAt: (new Date()).toLocaleString(),
                    createdBy: 'ALEX',
                  }
                })
              }} />
            </Col>
          </Row>]
        )
      case '2':
        return ([
          <Row key='1' style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>折扣数量</Col>
            <Col span={12}>
              <Input placeholder="折扣名称" onChange={(e) => {
                this.setState({
                  newItem: {
                    id: Math.floor(Math.random() * 1000 + 1),
                    name: e.target.value,
                    createdAt: (new Date()).toLocaleString(),
                    createdBy: 'ALEX',
                  }
                })
              }} />
            </Col>
          </Row>,
          <Row key='2' style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>选择会员</Col>
            <Col span={12}>
              <Input placeholder="折扣名称" onChange={(e) => {
                this.setState({
                  newItem: {
                    id: Math.floor(Math.random() * 1000 + 1),
                    name: e.target.value,
                    createdAt: (new Date()).toLocaleString(),
                    createdBy: 'ALEX',
                  }
                })
              }} />
            </Col>
          </Row>]
        )
      default:
        return
    }
  }
  render() {
    const { visible } = this.state
    return (
      <div style={this.props.style}>
        <Button onClick={this.showModal}>{this.props.buttonName}</Button>
        <Modal
          visible={visible}
          title={this.props.buttonName}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Row style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>折扣名称</Col>
            <Col span={12}>
              <Input placeholder="折扣名称" onChange={(e) => {
                this.setState({
                  newItem: {
                    id: Math.floor(Math.random() * 1000 + 1),
                    name: e.target.value,
                    createdAt: (new Date()).toLocaleString(),
                    createdBy: 'ALEX',
                  }
                })
              }} />
            </Col>
          </Row>
          <Row style={{ padding: '10px', fontSize: '13px' }} >
            <Col span={6}>选择折扣类型</Col>
            <Col span={12}>
              <Select labelInValue defaultValue={{ key: '0' }} style={{ width: '100%' }} onChange={(value) => this.setState({ value: value.key })}>
              <Option value="0">无</Option>
               {
                 config.map((item,key)=>{
                   return <Option value={item.id}>{item.name}</Option>
                 })
               } 
              </Select>
            </Col>
          </Row>
          {this.createDiscount()}
        </Modal>
      </div>
    )
  }
}

module.exports = AddDiscount