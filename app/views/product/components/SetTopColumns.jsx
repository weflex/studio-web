import React, { Component } from 'react'
import AddProduct from './AddProduct'
import { Input, Icon } from 'antd'
const Search = Input.Search;
class SetTopColumns extends React.Component {

  render() {
    const { config, extra } = this.props
    return (
      <div className='search'>
        <div style={{ display: 'inline', paddingRight: '10px' }} onClick={() => { console.log(1) }}><Icon type="filter" style={{ fontSize: 16 }} /></div>
        <Search
          placeholder="请输入文本"
          style={{ width: 200 }}
          onSearch={value => console.log(value)}
        />
        {extra}
      </div>
    )
  }
}

module.exports = SetTopColumns