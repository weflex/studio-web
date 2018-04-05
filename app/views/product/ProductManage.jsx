import React, { Component } from 'react';
import { Checkbox, Layout, Menu, Icon, Row, Col, Card, Input, Button, Popconfirm, message, Badge } from 'antd'
import ShoppingCard from './components/ShoppingCard'
import Counter from './components/Counter'
import AddProduct from './components/AddProduct'
import SetTopColumns from './components/SetTopColumns'
import { client } from '../../api';
import './index.css'
const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const text = '是否删除此产品';

export default class extends Component {

  constructor(props) {
    super(props);
    this.state = {
      refs: {},
      current: 'cards',
      name: 'products',
      collapsed: true,
      show: false,
      cacheShopping: [],
      total: 0,
      allChecked: false,
      showBalance: false
    }
    this.balance = this.balance.bind(this)
    this.checkShoppingCard = this.checkShoppingCard.bind(this)
    this.setNode = this.setNode.bind(this)
    this.delShoppingCard = this.delShoppingCard.bind(this)
    this.editShoppingCard = this.editShoppingCard.bind(this)
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  createSetting(id) {
    return [
      <div key={'edit'} style={{ display: 'inline', marginRight: '10px' }} onClick={this.editProduct.bind(this)}><Icon type="edit" style={{ fontSize: 16 }} /></div>,
      <Popconfirm key={'del'} placement="topRight" title={text} onCancel={() => this.cancel(id)} onConfirm={() => this.confirm(id)} okText="Yes" cancelText="No">
        <Icon type="delete" style={{ fontSize: 16, marginRight: 10 }} />
      </Popconfirm>]
  }

  confirm(id) {
    const { name } = this.state
    const delData = this.props.delData
    delData(name, id)
  }

  cancel(id) {
    message.error('Click on No');
  }

  editProduct(e) {
    const index = e.target.title
    let product = this.state.product
  }

  createCard() {
    const product = this.props.data
    const { cacheShopping } = this.state
    let col = []
    for (let i = 0; i < product.length; i++) {
      let currShoppingProduct = cacheShopping.find((item) => {
        return item.id == product[i].id
      })
      col.push(
        <Col key={i} style={{ padding: '10px' }} xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card key={product[i].id} title={product[i].productDetail.productName} loading={false} bordered={false} extra={this.createSetting(product[i].id)}>
            <div className="custom-image">
              <img alt="example" width="100%" src={product[i].imageUrl} />
            </div>
            <div className='price'>
              <div className='price-left' >
                <span>￥{product[i].productPricing.unitPrice}</span>
                <span style={{ textDecoration: 'line-through', color: 'red', position: 'relative', top: '2px' }}>￥{product[i].delPrice}</span>
              </div>
              <Counter setNode={this.setNode} productId={product[i].id} />
            </div>
            <div style={{ paddingTop: '5px' }}>
              <Button className='btn-join' onClick={() => this.addCacheShopping(product[i].id)}>加入购物车</Button>
              <Button className='btn-add' >立刻购买</Button>
            </div>
          </Card>
        </Col>)
    }
    return <Row gutter={24}>{col}</Row>
  }

  setNode(productId, node) {
    let refs = this.state.refs
    refs[productId] = node
    this.setState({
      refs
    })
  }

  get config() {
    return {
      name: '创建新产品'
    }
  }

  newProduct() {
    return (<AddProduct style={{ float: 'right', marginRight: 60 }} buttonName={this.config.name} />)
  }

  showShopping(e) {
    if (!this.state.show) {
      let right = parseInt(this.container.style.right)
      let index = setInterval(() => {
        if (right >= 0) {
          clearInterval(index)
        } else {
          right += 40
          this.container.style.right = right + 'px'
        }
      }, 10)
      this.setState({
        show: true
      })
    } else {
      let right = parseInt(this.container.style.right)
      let index = setInterval(() => {
        if (right <= -280) {
          clearInterval(index)
        } else {
          right -= 40
          this.container.style.right = right + 'px'
        }
      }, 10)
      this.setState({
        show: false
      })
    }
  }

  createShoppingCard() {
    const cacheShopping = this.state.cacheShopping
    return cacheShopping.map((item) => {
      return <ShoppingCard
        key={item.id}
        data={item}
        delShoppingCard={this.delShoppingCard}
        checkShoppingCard={this.checkShoppingCard}
        editShoppingCard={this.editShoppingCard}
      />
    })
  }


  addCacheShopping(productId) {
    let { cacheShopping, refs } = this.state
    const index = cacheShopping.findIndex((item) => {
      return item.id == productId ? item.num += parseInt(refs[productId].props.value) : false
    })
    if (index == -1) {
      cacheShopping.push({
        id: productId,
        num: parseInt(refs[productId].props.value),
        checked: false,
      })
    }
    this.setState({
      cacheShopping
    }, () => {
      this.balance()
    })
  }

  editShoppingCard(...param) {
    let cacheShopping = this.state.cacheShopping
    if (param[0] == 'plus') {
      let index = cacheShopping.find((item) => {
        return item.id == param[1]
      })
      index.num += 1
    } else if (param[0] == 'minus') {
      let index = cacheShopping.find((item) => {
        return item.id == param[1]
      })
      if (index.num > 1) {
        index.num -= 1
      }
    }
    this.setState({
      cacheShopping
    })
  }

  checkShoppingCard(product, checked) {
    let { cacheShopping } = this.state
    const allChecked = cacheShopping.filter((item) => {
      return item.id == product.id ? item.checked = checked && checked : item.checked
    })
    this.setState({
      cacheShopping,
      showBalance: allChecked.length > 0,
      allChecked: allChecked.length == cacheShopping.length ? true : false
    }, () => {
      this.balance()
    })
  }

  delShoppingCard(productId) {
    let { cacheShopping } = this.state
    cacheShopping.splice(cacheShopping.findIndex((e) => { return e.id == productId }), 1)
    this.setState({
      cacheShopping
    })
  }


  balance() {
    let { cacheShopping } = this.state
    let total = 0
    cacheShopping.map((item) => {
      return this.props.data.map((piece) => {
        return item.id == piece.id && item.checked ? total += (piece.productPricing.unitPrice * item.num) : false
      })
    })
    this.setState({
      total
    })
  }

  render() {
    const { allChecked, showBalance, show, cacheShopping, total } = this.state
    return (
      <Layout>
        <Header>
          <SetTopColumns config={this.config} extra={this.newProduct()} />
        </Header>
        <Content >
          <div style={{ float: 'left', width: '95%', margin: '30px 50px 0 30px', height: '100%' }} >
            {this.createCard()}
          </div>
          <div style={{ position: 'fixed', right: -280, top: 0, zIndex: '999', float: 'right', width: '315px', height: '100%' }} ref={(node) => { this.container = node; }}>
            <div style={{ color: 'white', background: 'black', float: 'left', height: '100%', width: '35px' }} >
              <div className={'shopping-card ' + (show ? 'shopping-card-show' : '')} onClick={this.showShopping.bind(this)}>
                <Icon type='shopping-cart' style={{ margin: '8px 0', fontSize: '20px' }}>
                  <div style={{
                    fontSize: '12px',
                    textAlign: 'center',
                    color: '#fff',
                    padding: '6px',
                    fontWeight: 'bold',
                    lineHeight: '20px'
                  }}>购物车</div>
                  <Badge count={cacheShopping.length} style={{ color: '#fff', backgroundColor: '#FF0036', fontSize: '12px' }} />
                </Icon>
              </div>
            </div>
            <div style={{
              float: 'right',
              width: '280px',
              height: '100%',
              backgroundColor: '#e6e6e6',
            }}>
              <div style={{ height: '90%', overflowX: 'hidden' }}>
                <div>
                  <Checkbox
                    checked={allChecked}
                    style={{
                      margin: '8px'
                    }}
                    onChange={(e) => {
                      cacheShopping.map((item) => {
                        item.checked = e.target.checked
                      })
                      this.setState({
                        cacheShopping,
                        allChecked: e.target.checked,
                        showBalance: e.target.checked
                      }, () => {
                        this.balance()
                      })
                    }}
                  >全选</Checkbox>
                  {this.createShoppingCard()}
                </div>
              </div>
              <div style={{
                position: 'fixed',
                bottom: '0',
                width: '280px',
                backgroundColor: '#e6e6e6',
                zIndex: 3,
                padding: '15px 16px',
              }}>
                <div style={{
                  width: '248px',
                  height: '30px'
                }}>
                  <span>
                    已选{cacheShopping.filter((item) => {
                      return item.checked
                    }).length}件
                  </span>
                  <span style={{
                    float: 'right'
                  }}>
                    ￥{total}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  lineHeight: '40px'
                }}>
                  <div className={showBalance ? 'shopping-card-balance-open' : 'shopping-card-balance-disabled'} ><span style={{
                    color: '#FFF',
                    fontSize: '14px'
                  }}>结算</span></div>
                </div>
              </div>
            </div>
          </div>
        </Content>
      </Layout >
    )
  }
}
