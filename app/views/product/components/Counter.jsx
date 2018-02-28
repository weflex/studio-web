import React, { Component } from 'react';
import { Icon, Input } from 'antd';
import '../index.css'

class Counter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0,
      plus: <Icon type="plus-square-o" style={{ fontSize: 16 }} onClick={this.plusNumber.bind(this)} />,
      minus: <Icon type="minus-square-o" style={{ fontSize: 16 }} onClick={this.minusNumber.bind(this)} />,
    }
    this.checkNumber = this.checkNumber.bind(this)
  }

  plusNumber() {
    let number = this.state.number
    this.setState({
      number: ++number
    })
    console.log(this.state.number)
  }

  minusNumber() {
    let number = this.state.number
    if (number - 1 > -1) {
      this.setState({
        number: --number
      })
    }
    console.log(this.state.number)
  }

  checkNumber(e) {
    console.log(e.target.value)
    let number = this.state.number
    if (!(/(^[1-9]\d*$)/.test(e.target.value))) {
      e.target.value = 0
    } else {
      this.setState({
        number: e.target.value
      })
    }
  }

  render() {
    const { plus, minus, number } = this.state
    return (
      <div className="counter">
        <Input style={{ width: '100px' }} addonBefore={minus} addonAfter={plus} value={number} onChange={this.checkNumber} />
      </div>
    )
  }
}
module.exports = Counter