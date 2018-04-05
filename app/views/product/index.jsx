import React, { Component } from 'react';
import { Tabs, Icon, Input, message } from 'antd'
import ProductManage from './ProductManage'
import ProductCategoryManage from './ProductCategoryManage'
import BandManage from './BandManage'
import DiscountManage from './DiscountManage'
import { client } from '../../api';
import './index.css'
import products from '../../../assets/data/products.json'
import productCategorys from '../../../assets/data/productCategorys.json'
import bands from '../../../assets/data/bands.json'
import discounts from '../../../assets/data/discounts.json'
const TabPane = Tabs.TabPane;

class Product extends Component {

  constructor(props) {
    super(props);

    this.state = {
      current: 'cards',
      products: products,
      productCategorys: productCategorys,
      bands: bands,
      discounts: discounts
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
  addData(dataSource, newItem) {
    let state = this.state
    state[dataSource].unshift(newItem)
    this.setState({
      state
    })
  }
  render() {
    const { products, productCategorys, bands, discounts } = this.state
    return (
      <Tabs defaultActiveKey="4">
        <TabPane tab={<span><Icon type="apple" />产品展示</span>} key="1">
          <ProductManage
            {...this.crudActions}
            data={products}
          />
        </TabPane>
        <TabPane tab={<span><Icon type="android" />分类管理</span>} key="2">
          <ProductCategoryManage
            {...this.crudActions}
            data={productCategorys} />
        </TabPane>
        <TabPane tab={<span><Icon type="android" />品牌管理</span>} key="3">
          <BandManage
            {...this.crudActions}
            data={bands} />
        </TabPane>
        <TabPane tab={<span><Icon type="android" />折扣管理</span>} key="4">
          <DiscountManage
            {...this.crudActions}
            data={discounts}
          />
        </TabPane>
      </Tabs>
    )
  }
}

module.exports = Product;