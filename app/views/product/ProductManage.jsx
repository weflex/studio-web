import React, { Component } from 'react';
import { Layout, Card, Input, Menu, Breadcrumb, Icon } from 'antd';
import data from '../../../assets/data/productCategorys.json'
import productDate from '../../../assets/data/products.json'
const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const Search = Input.Search;

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      defaultCategorys: ''
    }
    this.showProduct = this.showProduct.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    this.setState({
      defaultCategorys: data[0].id
    })
  }

  handleClick(e) {
    this.setState({
      defaultCategorys: e.key
    })
  }

  showProduct() {
    const categoryId = this.state.defaultCategorys
    return productDate.map((item) => {
      return item.productCategoryId == categoryId ? <Card key={item.id} style={{ width: 300 }}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card> : ""
    })
  }

  render() {
    return (
      <Layout style={{ minHeight: '92vh' }}>
        <Sider
          width={200} style={{ background: '#fff', borderRight: "1px solid #d9d9d9" }}
        >
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <Search
              placeholder="请输入文本"
              style={{ width: 150 }}
              onSearch={value => console.log(value)}
            />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={['0']}
            style={{ height: '100%' }}
            onClick={this.handleClick}
          >
            {
              data.map((item) => {
                return <Menu.Item key={item.id}>{item.name}</Menu.Item>
              })
            }
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: "#ececec", padding: 0 }} >
            <h2 style={{ fontSize: "20px", paddingLeft: "16px" }}>{data[0].name}</h2>
          </Header>
          <Content style={{ margin: '0 16px' }}>
            {/* <div style={{ background: '#fff', minHeight: 360 }}> */}
              {this.showProduct()}
            {/* </div> */}
          </Content>
        </Layout>
      </Layout>
    )
  }
}
