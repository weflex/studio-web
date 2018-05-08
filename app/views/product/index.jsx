import React, { Component } from 'react';
import { Tabs, Icon, Input, message } from 'antd'
import ProductManage from './ProductManage'
import TransactionHistory from './TransactionHistory'
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
      transaction: [],
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

    const transaction = await client.transaction.list({
      where: {
        venueId: venue.id
      }, include: [{
        relation: 'userBought',
        scope: {
          include: [{
            relation: 'members',
            scope: {
              where: {
                venueId: venue.id,
                trashedAt: {
                  exists: false
                }
              }
            }
          }]
        }
      }, {
        relation: 'transactionStatus',
        scope: {
          include: [{
            relation: 'transactionStatusDetail',
            scope: {
              where: {
                locale: 'zh'
              }
            }
          }]
        }
      }, {
        relation:'transactionDetail',
        scope:{
          include:[{
            relation:'product',
            scope:{
              include:['productDetail']
            }
          },'productPricing']
        }
      }
        , { 'paymentType': 'paymentType' }
      ]
    })
    this.setState({
      transaction,
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
    const { showProductModel, products, productCategorys, defaultCategory, transaction } = this.state
    return (
      <Tabs style={{ height: '100%' }} defaultActiveKey="1">
        <TabPane tab={<span><Icon type="gift" />产品管理</span>} key="1">
          {
            defaultCategory ? <ProductManage
              {...this.crudActions}
              data={{ products, productCategorys, defaultCategory }}
            /> : ''
          }
        </TabPane>
        <TabPane tab={<span><Icon type="bar-chart" />订单列表</span>} key="2">
          <TransactionHistory data={transaction} />
        </TabPane>
      </Tabs>
    )
  }
}

module.exports = Product;