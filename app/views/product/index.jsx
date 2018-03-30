import React, { Component } from 'react';
import { Tabs, Icon, Input, message } from 'antd'
import ProductManage from './ProductManage'
import ProductCategoryManage from './ProductCategoryManage'
import BandManage from './BandManage'
import DiscountManage from './DiscountManage'
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
      bands: [],
      discounts: []
    }
  }
  get title() {
    return '产品管理';
  }
  get actions() {
    return [];
  }

  componentDidMount() {
    let { productCategorys, products, bands, discounts } = this.state
    for (let i = 0; i < 100; i++) {
      const prodcutCategory = {
        id: i,
        name: `产品分类 ${i}`,
        createdAt: (new Date()).toLocaleString(),
        createdBy: 'ALEX',
      }
      productCategorys.push(prodcutCategory)
      const band = {
        id: i,
        name: `品牌 ${i}`,
        createdAt: (new Date()).toLocaleString(),
        createdBy: 'ALEX',
      }
      bands.push(band)
      const discount = {
        id: i,
        name: `折扣${i}`,
        createdAt: (new Date()).toLocaleString(),
        endAt: (new Date()).toLocaleString(),
        createdBy: 'ALEX',
        description: '很大的折扣',
        memberPriceOff: '1',
        product: [{
          id: 1000 + i,
          name: `农夫山泉 ${i}`,
          price: 1000,
          delPrice: 2000,
          imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png',
          code: 1112,
          createdBy: 'ALEX',
        }]
      }
      discounts.push(discount)
    }
    discounts.map((item) => {
      products = products.concat(item.product)
    })
    this.setState({
      productCategorys,
      products,
      bands,
      discounts
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
           item.product.splice(index,1)
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

  addData(dataSource, newItem) {
    let state = this.state
    state[dataSource].push(newItem)
    this.setState({
      state
    })
  }
  render() {
    const { products, productCategorys, bands, discounts } = this.state

    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><Icon type="apple" />产品展示</span>} key="1">
          <ProductManage
            editData={this.editData.bind(this)}
            delData={this.delData.bind(this)}
            addData={this.addData.bind(this)}
            data={products} />
        </TabPane>
        <TabPane tab={<span><Icon type="android" />分类管理</span>} key="2">
          <ProductCategoryManage
            editData={this.editData.bind(this)}
            delData={this.delData.bind(this)}
            addData={this.addData.bind(this)}
            data={productCategorys} />
        </TabPane>
        <TabPane tab={<span><Icon type="android" />品牌管理</span>} key="3">
          <BandManage
            editData={this.editData.bind(this)}
            delData={this.delData.bind(this)}
            addData={this.addData.bind(this)}
            data={bands} />
        </TabPane>
        <TabPane tab={<span><Icon type="android" />折扣管理</span>} key="4">
          <DiscountManage
            editData={this.editData.bind(this)}
            delData={this.delData.bind(this)}
            addData={this.addData.bind(this)}
            data={discounts}
          />
        </TabPane>
      </Tabs>
    )
  }
}

module.exports = Product;