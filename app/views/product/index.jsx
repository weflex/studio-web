import React, { Component } from 'react';
import { Layout, Menu, Icon, Row, Col, Card, Input, Button, Popconfirm, message,Modal } from 'antd'
import Counter from './components/Counter'
import AddProduct from './components/AddProduct'
import './index.css'
const { Header, Footer, Sider, Content } = Layout;
const Search = Input.Search;
const text = '是否删除此产品';
class Product extends Component {

  constructor(props) {
    super(props);

    this.state = {
      delIndex: null,
      current: 'cards',
      product: [{
        name: '农夫山泉',
        price: 1000,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
      }, {
        name: '农夫山泉',
        price: 1100,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
      }, {
        name: '农夫山泉',
        price: 1200,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
      }, {
        name: '农夫山泉',
        price: 1300,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
      }, {
        name: '农夫山泉',
        price: 1400,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
      }, {
        name: '农夫山泉',
        price: 1500,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
      }, {
        name: '农夫山泉',
        price: 1600,
        delPrice: 2000,
        imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
      }]
    }
  }
  get title() {
    return '产品管理';
  }
  get actions() {
    return [];
  }

  componentDidMount() {

  }

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
  }

  createSetting(i) {
    return [
      <div style={{ display: 'inline', marginRight: '10px' }} onClick={this.editProduct.bind(this)}><Icon title={i} type="edit" style={{ fontSize: 16 }} /></div>,
      <Popconfirm index={i} placement="topRight" title={text} onCancel={this.cancel.bind(this)} onConfirm={this.confirm.bind(this)} okText="Yes" cancelText="No">
        <Icon title={i} type="delete" style={{ fontSize: 16, marginRight: 10 }} onClick={this.delProduct.bind(this)} />
      </Popconfirm>]
  }

  confirm(e) {
    const { delIndex, product } = this.state
    product.splice(delIndex, 1)
    this.setState({
      product
    })
    message.success('Click on Yes');
  }

  cancel(e) {
    this.setState({
      delIndex: null
    })
    message.error('Click on No');
  }

  editProduct(e) {
    const index = e.target.title
    let product = this.state.product

  }

  delProduct(e) {
    const index = e.target.title
    this.setState({
      delIndex: index
    })
  }


  manageMenu() {
    const current = this.state.current
    switch (current) {
      case 'cards':
        return this.createCard();
      case 'category':
        return this.changeProductcategory();
      default:
        return this.createCard();
    }
  }

  changeProductcategory(){
    return 
  }
  createCard() {
    const product = this.state.product
    let col = []
    for (let i = 0; i < product.length; i++) {
      col.push(
        <Col key={i} span={4} style={{ padding: '10px' }}>
          <Card title={product[i].name} loading={false} bordered={false} extra={this.createSetting(i)}>
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
  
  render() {
    return (
      <Layout>
        <Header>
          <Menu
            onClick={this.handleClick}
            selectedKeys={[this.state.current]}
            mode="horizontal"
          >
            <Menu.Item key="cards">
              <Icon type="mail" />产品展示
        </Menu.Item>
            <Menu.Item key="category">
              <Icon type="appstore" />产品类别
        </Menu.Item>
          </Menu>
        </Header>
        <Content>
          <div className='search'>
            <div style={{ display: 'inline', paddingRight: '10px' }} onClick={() => { console.log(1) }}><Icon type="filter" style={{ fontSize: 16 }} /></div>
            <Search
              placeholder="input search text"
              style={{ width: 200 }}
              onSearch={value => console.log(value)}
            />
            <AddProduct style={{ float: 'right', marginRight: 10 }} buttonName='创建新产品' >创建产品</AddProduct>
          </div>
          <div style={{ background: '#FAFAFA', padding: '30px', minWidth: '1429px' }}>
            {this.manageMenu()}
          </div>
        </Content>
        {/* <Footer>Footer</Footer> */}
      </Layout>)
  }
}

module.exports = Product;