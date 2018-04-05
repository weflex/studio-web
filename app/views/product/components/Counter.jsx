import React, { Component } from 'react';
import { Icon, Input } from 'antd';
import '../index.css'

class Counter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      num:1,
      productId:this.props.productId,
      plus: <Icon type="plus-square-o" style={{ fontSize: 16 }} onClick={this.plusNumber.bind(this)} />,
      minus: <Icon type="minus-square-o" style={{ fontSize: 16 }} onClick={this.minusNumber.bind(this)} />,
    }
    this.checkNumber = this.checkNumber.bind(this)
  }

  componentDidMount(){
    this.props.setNode(this.props.productId,this.container)
  }
  plusNumber() {
    let {productId,num} = this.state
    this.setState({
      num:++num
    })
    this.props.setNode(productId,this.container)
  }

  minusNumber() {
    let {number,productId,num} = this.state
    if (num - 1 > -1) {
      this.setState({
        num:--num
      })
      this.props.setNode(productId,this.container)
    }
  }

  checkNumber(e) {
    let {productId} = this.state
    if (!(/(^[1-9]\d*$)/.test(e.target.value))) {
      e.target.value = 1
    } else {
      this.setState({
        num:e.target.value
      })
      this.props.setNode(productId,this.container)
    }
  }

  render() {
    const { plus, minus,num } = this.state 
    return (
      <div className="counter">
        <Input ref={(node) => { this.container = node; }} style={{ width: '100px' }} addonBefore={minus} addonAfter={plus} defaultValue={num} value={num} onChange={(e)=>this.setState({ num: e.target.value })} onBlur={this.checkNumber} />
      </div>
    )
  }
}
module.exports = Counter