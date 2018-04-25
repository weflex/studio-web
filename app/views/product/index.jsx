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
    this.editData = this.editData.bind(this)
    this.getData = this.getData.bind(this)
  }
  get title() {
    return '产品管理';
  }
  get actions() {
    return [];
  }

  async componentDidMount() {
    await this.getData()
  }

  async getData(defaultCategoryId) {
    const venue = await client.user.getVenueById();
    const productCategorys = await client.productCategory.list({
      where: {
        venueId: venue.id,
        deletedAt: {
          exists: false
        }
      },
      include: [{
        relation: 'product',
        scope: {
          where: {
            deletedAt: {
              exists: false
            }
          },
          include: [
            {
              relation: 'productDetail',
            },
            {
              relation: 'productPricing',
              scope: {
                order: 'id DESC',
                limit: 1,
              },
            }
          ]
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
    const products = await client.product.list(
      {
        where: {
          venueId: venue.id,
          deletedAt: {
            exists: false
          }
        },
        include: [
          {
            relation: 'productDetail',
          },
          {
            relation: 'productPricing',
            scope: {
              order: 'id DESC',
              limit: 1,
            },
          }
        ]
      }
    )
    productCategorys.unshift({
      id: '1',
      product: products,
      productCategoryDetail: [{
        category: '所有'
      }]
    })
    let defaultCategory = productCategorys[0]
    if (defaultCategoryId) {
      defaultCategory = productCategorys.find((item) => {
        return item.id == defaultCategoryId
      })
    }
    this.setState({
      products,
      productCategorys,
      defaultCategory
    })
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
      addData: this.addData,
      getData: this.getData
    }
  }

  render() {
    const { showProductModel, products, productCategorys, defaultCategory } = this.state
    return (
      <Tabs style={{ height: '100%' }} defaultActiveKey="1">
        <TabPane tab={<span><Icon type="apple" />产品管理</span>} key="1">
          {
            defaultCategory ? <ProductManage
              {...this.crudActions}
              data={{ products, productCategorys, defaultCategory }}
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