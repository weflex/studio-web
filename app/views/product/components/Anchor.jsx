import React, { Component } from 'react';
import { Icon } from 'antd'
import './Anchor.css'
class Anchor extends Component {

  render() {
    const { style, type, value } = this.props
    return (
      <div className='product-anchor' style={style} {...this.props}>
        <Icon type={type} className='product-anchor-icon' />
        <span style={{
          textAlign: 'center'
        }}>{value}</span>
      </div>
    )
  }
}

export default Anchor;