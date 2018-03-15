import React, { Component } from 'react';
import { Layout, Icon, Row, Col, Card, Input, Button, Popconfirm, message } from 'antd'
import Counter from './components/Counter'
import AddProduct from './components/AddProduct'
import SetTopColumns from './components/SetTopColumns'
import { client } from '../../api';
import './index.css'
const { Header, Content } = Layout;
const Search = Input.Search;
const text = '是否删除此产品';

export default class extends Component {

  constructor(props) {
    super(props);
    this.state = {
      current: 'cards',
      name: 'products'
    }
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
    let col = []
    for (let i = 0; i < product.length; i++) {
      col.push(
        <Col key={i} style={{ padding: '10px' }} xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card key={product[i].id} title={product[i].name} loading={false} bordered={false} extra={this.createSetting(product[i].id)}>
            <div className="custom-image">
              <img alt="example" width="100%" src={product[i].imageUrl} />
            </div>
            <div className='price'>
              <div className='price-left' >
                <span>￥{product[i].price}</span>
                <span style={{ textDecoration: 'line-through', color: 'red', position: 'relative', top: '2px' }}>￥{product[i].delPrice}</span>
              </div>
              <Counter />
            </div>
            <div style={{ paddingTop: '5px' }}>
              <Button className='btn-join' >加入购物车</Button>
              <Button className='btn-add' >立刻购买</Button>
            </div>
          </Card>
        </Col>)
    }
    return <Row gutter={24}>{col}</Row>
  }

  get config() {
    return {
      name: '创建新产品'
    }
  }

  newProduct() {
    return (<AddProduct style={{ float: 'right', marginRight: 10 }} buttonName={this.config.name} />)
  }

  render() {
    return (
      <Layout>
        <Header>
          <SetTopColumns config={this.config} extra={this.newProduct()} />
        </Header>
        <Content>
          <div style={{ background: '#FAFAFA', padding: '30px' }}>
            {this.createCard()}
          </div>
        </Content>
      </Layout>
    )
  }
}
