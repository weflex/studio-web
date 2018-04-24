import React, { Component } from 'react';
import { Tabs, Icon, Input, message } from 'antd'
import ProductManage from './ProductManage'
import { client } from '../../api';
import './index.css'
const TabPane = Tabs.TabPane;

class Product extends Component {

  constructor(props) {
    super(props);

    this.state = {
      current: 'cards',
      products: [],
      productCategorys: [],
      showProductModel: true
    }
    this.delData = this.delData.bind(this)
    this.editData = this.editData.bind(this)
    this.addData = this.addData.bind(this)
  }
  get title() {
    return '产品管理';
  }
  get actions() {
    return [];
  }

  async componentDidMount() {
    const venue = await client.user.getVenueById();
    const productCategorys = await client.productCategory.list({
      where: {
        venueId: venue.id,
      },
      include: [{
        relation: 'product',
        scope: {
          include: ['productDetail', 'productPricing']
        },
      }, {
        relation: 'productCategoryDetail',
        scope: {
          where: {
            locale: "zh"
          }
        }
      }]
    })
    console.log(productCategorys)
    const products = await client.product.listByVenueId(venue.id)
    this.setState({
      productCategorys,
      products
    })
  }

  delData(dataSource, ...param) {
    const state = this.state
    if (param.length == 1) {
      state[dataSource].splice(state[dataSource].findIndex((e) => { return e.id == param[0] }), 1)
    } else if (param.length == 2 && dataSource == 'discounts') {
      state[dataSource].find((item) => {
        if (item.id == param[0]) {
          const index = item.product.findIndex((e) => e.id == param[1])
          item.product.splice(index, 1)
        }
      })
    }
    this.setState({
      state
    })
    message.success('Click on Yes');
  }

  editData(dataSource, data) {
    let state = this.state
    state[dataSource] = data
    this.setState({
      state
    })
  }

  get crudActions() {
    return {
      editData: this.editData,
      delData: this.delData,
      addData: this.addData
    }
  }
  addData(dataSource, newItem, productCategoryId) {
    let state = this.state
    state[dataSource].find((item) => {
      if (item.id == productCategoryId) {
        return item.product.unshift(newItem)
      }
    })
    this.setState({
      state
    })
  }

  // showCreateProduct() {
  //   this.setState({
  //     showProductModel: false
  //   })
  // }

  render() {
    const { showProductModel, products, productCategorys } = this.state
    return (
      <Tabs style={{ height: '100%' }} defaultActiveKey="1">
        <TabPane tab={<span><Icon type="apple" />产品管理</span>} key="1">
          {
            productCategorys.length > 0 ? <ProductManage
              {...this.crudActions}
              data={{ products, productCategorys }}
              showCreateProduct={this.showCreateProduct}
            /> : ''
          }
        </TabPane>
        {/* <TabPane tab={<span><Icon type="android" />回收站</span>} key="2">
          <ProductCategoryManage
            {...this.crudActions}
            data={productCategorys} />
        </TabPane> */}
      </Tabs>
    )
  }
}

module.exports = Product;