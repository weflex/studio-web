import React, { Component } from 'react'
import { Checkbox } from 'antd';
import './ShoppingCard.css'
class ShoppingCard extends React.Component {
  render() {

    return (
      <div style={{
        backgroundColor: 'white',
        marginBottom: '16px',
        padding:'0 8px'
      }}>
        <div style={{
          borderBottom: '1px solid #e6e6e6',
          padding: '5px 0px'
        }}>我只是一个标题</div>
        <div className='shoppingCard-item'>
          <Checkbox />
          <div>
            <img className='shoppingCard-img' src='https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png' />
          </div>
          <div style={{
            width: '54px'
          }}>
            <p style={{
              width: '100%',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>这只是一个简要介绍</p>
          </div>
          <div>1</div>
          <div>￥2000</div>
        </div>
      </div>
    )
  }
}
module.exports = ShoppingCard