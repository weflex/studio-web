import React, { Component } from 'react';
import { Tabs, Icon, Input, message } from 'antd'
import ProductManage from './ProductManage'
import ProductCategoryManage from './ProductCategoryManage'
import BandManage from './BandManage'
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
      bands: []
    }
  }
  get title() {
    return '产品管理';
  }
  get actions() {
    return [];
  }

  componentDidMount() {
    let { productCategorys, products, bands } = this.state
    for (let i = 0; i < 8; i++) {
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
      const product = {
        id: 1000 + i,
        name: `农夫山泉 ${i}`,
        price: 1000,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png',
        code: 1112
      }
      products.push(product)
    }
    this.setState({
      productCategorys,
      products,
      bands
    })
  }

  delData(dataSource, delId) {
    const state = this.state
    state[dataSource].splice(state[dataSource].findIndex((e) => { return e.id == delId }), 1)
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
    const { products, productCategorys, bands } = this.state

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
        </TabPane>
      </Tabs>
    )
  }
}

module.exports = Product;