import React, { Component } from 'react'
import { Checkbox, Icon } from 'antd';
import './ShoppingCard.css'
import products from '../../../../assets/data/products.json'
class ShoppingCard extends React.Component {
  state = {
    data: this.props.data,
  }

  render() {
    const { data, showDel } = this.state
    const currentProduct = products.find((item) => {
      return item.id == data.id
    })
    const price = data.num * currentProduct.productPricing.unitPrice
    return (
      <div
        style={{
          backgroundColor: 'white',
          marginBottom: '16px',
          padding: '0 8px'
        }}>
        <div
          style={{
            borderBottom: '1px solid #e6e6e6',
            padding: '5px 0px'
          }}>
          {currentProduct.productDetail.productName}
          <Icon onClick={() => {
            this.props.delShoppingCard(currentProduct.id)
          }} type="delete" style={{ fontSize: 16, marginRight: 10, float: 'right' }} />
        </div>
        <div className='shoppingCard-item'>
          <Checkbox checked={data.checked} onChange={(e) => {
            this.props.checkShoppingCard(data, e.target.checked)
          }} />
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
            }}>{currentProduct.productDetail.productDescription}</p>
          </div>
          <div style={{ width: '80px', textAlign: 'center' }}>
            <Icon onClick={() => {
              this.props.editShoppingCard('minus', currentProduct.id)
            }} type="minus-circle-o" />
            <span style={{ padding: '0 5px' , cursor: 'default'}}>{data.num}
            </span>
            <Icon onClick={() => {
              this.props.editShoppingCard('plus', currentProduct.id)
            }} type="plus-circle-o" />
          </div>
          <div>￥{price}</div>
        </div>
      </div>
    )
  }
}
module.exports = ShoppingCard