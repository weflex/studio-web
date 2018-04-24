import React, { Component } from 'react';
import {
  Layout, Row, Col,
  Button, Icon, Card, Input, Menu, Modal, Select, DatePicker, Upload, Checkbox, Popconfirm
} from 'antd';
import { client } from '../../api'
import './index.css'
import Anchor from './components/Anchor'
const async = require('async')
const { MonthPicker, RangePicker } = DatePicker;
const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const Search = Input.Search;
const text = '是否删除此产品';
export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      defaultCategory: this.props.data.productCategorys[0],
      viewModel: false,
      visible: false,
      refs: {},
      categoryName: 'productCategorys',
      newCategoryName: '',
      productName: 'products',
      classPackages: [],
      type: '',
      classPackageItem: {},
      cacheProduct: {},
      isCategoryEdit: false,
      isCheck: false,
      cacheProducts: [],
      allChoose: false
    }
    this.showProduct = this.showProduct.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.showCreate = this.showCreate.bind(this)
    this.setAttribute = this.setAttribute.bind(this)
    this.changeDateRange = this.changeDateRange.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.unsetAvailable = this.unsetAvailable.bind(this)
    this.setAvailable = this.setAvailable.bind(this)
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({
  //     defaultCategory: nextProps.data.productCategorys[0]
  //   })
  // }

  async componentDidMount() {
    try {
      const venue = await client.user.getVenueById();
      const user = await client.user.getCurrent();
      const brand = await client.context.request(
        '/api/brand',
        'get',
        {
          where: {
            venueId: venue.id
          }
        }
      )
      const data = await client.classPackage.list({
        where: {
          venueId: venue.id,
        }
      });
      this.setState({
        brandId: brand[0].id,
        venueId: venue.id,
        classPackage: data,
        user
      })
    } catch (err) {
      console.log(err)
    }

  }
  handleClick(e) {
    const category = this.props.data.productCategorys
    const defaultCategory = category.find((item) => {
      return item.id == e.key
    })
    this.setState({
      defaultCategory
    })
  }

  showCreate() {
    let viewModel = this.state.viewModel
    this.setState({
      viewModel: !viewModel
    })
  }


  async confirm(id) {
    try {
      await client.product.delete(id)
    } catch (err) {
      console.log(err)
    }
  }

  showProduct() {
    const category = this.state.defaultCategory
    const isCheck = this.state.isCheck
    const cacheProducts = this.state.cacheProducts
    let col = []
    let products = category.product
    // console.log(products)
    products.map((item) => {
      let checked = cacheProducts.includes(item.id)
      if (!item.deletedAt) {
        col.push(
          <Col key={item.id} style={{ margin: '0 0 10px 0' }} xs={24} sm={24} md={24} lg={10} xl={6}>
            {
              isCheck ? <Checkbox
                checked={checked}
                onChange={
                  (e) => {
                    let cacheProducts = this.state.cacheProducts
                    if (e.target.checked) {
                      cacheProducts.push(item.id)
                    } else {
                      cacheProducts.splice(cacheProducts.indexOf(item.id), 1)
                    }
                    this.setState({
                      cacheProducts
                    })
                  }
                }
                style={{
                  position: 'absolute',
                  top: '12px',
                  zIndex: '99',
                  left: '16px'
                }} /> : ''
            }
            <Card key={item.id} style={{ width: 350, height: 200 }}>
              <div style={{ float: "left" }}>
                <p>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 'bold'
                  }}>{item.productDetail[0].productName}</span>
                </p>
                <p className='product-card' >￥
              <span>{item.productPricing[0].unitPrice}</span>
                </p>
                <p style={{
                  fontSize: '13px',
                  width: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={item.productDetail[0].productDescription} >
                  {item.productDetail[0].productDescription}
                </p>
                <p style={{ fontSize: '15px', position: 'absolute', bottom: '50px' }}>1000/1000</p>
                <div style={{ position: 'absolute', bottom: '10px' }}>
                  <Button >置满</Button>
                  <Popconfirm placement="topRight" title={text} onConfirm={() => this.confirm(item.id)} okText="Yes" cancelText="No">
                    <Button>删除</Button>
                  </Popconfirm>
                </div>
              </div>
              <div style={{ float: "right", width: 150 }}>
                <img width={150} height={145} src={item.imgUrl} />
                <Button style={{ float: 'right' }}>编辑</Button>
              </div>
            </Card >
          </Col>)
      }
    })
    return <Row gutter={24} >{col}</Row>
  }

  async handleOk(e) {
    const { newCategoryName, categoryName, cacheProduct, type, classPackageItem, venueId, user, brandId } = this.state
    const addData = this.props.addData
    if (newCategoryName) {
      try {
        let newCategory = await client.productCategory.create({
          createdAt: new Date(),
          venueId: venueId,
          createdBy: user.id,
          isEnabled: true,
          productCategoryDetail: [
            {
              category: newCategoryName,
              locale: "zh",
            }
          ]
        })
        if (typeof addData == 'function') {
          addData(categoryName, newCategory)
        }
      } catch (err) {
        console.log(err)
      }
    } else if (cacheProduct) {
      let detail = {
        productName: cacheProduct.name,
        brandId: brandId,
        productDescription: cacheProduct.description,
        locale: 'zh',
      }
      let productAttribute = {
        accessType: cacheProduct.accessType,
        description: cacheProduct.description,
        expiresAt: cacheProduct.expiresAt,
        packageId: cacheProduct.packageId,
        salesId: cacheProduct.salesId,
        startsAt: cacheProduct.startsAt,
      }
      if (cacheProduct.accessType == 'multiple') {
        productAttribute.available = cacheProduct.available
      }
      detail.attributes = productAttribute
      const product = await client.product.create({
        imgUrl: 'http://assets.theweflex.com/cardviews/' + classPackageItem.color.substr(1) + '.png',
        createdAt: new Date(),
        venueId,
        createdBy: user.id,
        productCode: '00',
        isAvailable: false,
        productDetail: [
          detail
        ],
        productPricing: [{
          createdBy: user.id,
          createdAt: new Date(),
          venueId: venueId,
          unitPrice: cacheProduct.price,
          currency: "CNY"
        }]
      })
      const productCategoryProduct = await client.productCategoryProduct.request(
        '',
        'post',
        {
          productId: product.id,
          productCategoryId: type.id
        })
      this.props.addData('productCategorys', product, type.id)
    }
    this.setState(
      {
        cacheProduct: {},
        type: '',
        classPackageItem: {},
        newCategoryName: '',
        visible: false
      }
    );
  }
  handleCancel = () => {
    this.setState(
      {
        type: '',
        classPackageItem: {},
        newCategoryName: '',
        visible: false
      }
    );
  }

  // setNode(productId, node) {
  //   let refs = this.state.refs
  //   refs[productId] = node
  //   this.setState({
  //     refs
  //   })
  // }

  handleChange = (info) => {
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
    }
    this.getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
  }

  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  beforeUpload(file) {
    const isImage = new Set(['image/png', 'image/jpg', 'image/jpeg', 'image/gif']);
    let isJPG = true
    if (!isImage.has(file.type)) {
      message.error(`文件(${file.name})不是图片格式：.png, .jpg, .jpeg, .gif。`);
      isJPG = false
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(`文件(${file.name})大小必须小于2M。`);
    } else {
      this.setState({
        size: file.size,
      });
    }
  }

  setAttribute() {
    let uploadData = {
      'token': this.state.token,
      'x:size': this.state.size,
    }
    const { type, classPackage, classPackageItem, cacheProduct, imageUrl } = this.state
    let data = []
    data.push(
      <li key='product-name'>
        <div className='product-detail'>产品名称</div>
        <Input onChange={(e) => {
          cacheProduct.name = e.target.value
          this.setState({
            cacheProduct
          })
        }} value={cacheProduct.name || ''} style={{
          width: '300px'
        }} />
      </li>)
    if (type.productCategoryDetail && type.productCategoryDetail[0].category == '会卡') {
      data.push(
        <li key='product-type'>
          <div className='product-detail'>模板选择</div>
          <Select style={{
            width: '300px'
          }} onChange={(value) => {
            const classPackageItem = classPackage.find((item) => {
              return item.id == value
            })
            let cacheProduct = {
              price: classPackageItem.price,
              accessType: classPackageItem.accessType,
              name: classPackageItem.name,
              venueId: classPackageItem.venueId,
              packageId: classPackageItem.id,
              salesId: null,
              description: classPackageItem.description
            }
            if (classPackageItem.accessType == 'multiple') {
              cacheProduct.available = classPackageItem.passes
            }
            this.setState({
              cacheProduct,
              classPackageItem: classPackageItem
            })
          }
          }>
            {
              classPackage.map((item) => {
                return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
              })
            }
          </Select>
        </li >)
      if (classPackageItem) {
        if (classPackageItem.accessType == 'multiple') {
          data.push(
            <li key='product-accessType'>
              <div className='product-detail'>有效次数</div>
              <Input onChange={(e) => {
                cacheProduct.available = e.target.value
                this.setState({
                  cacheProduct
                })
              }} value={cacheProduct.available || 0} style={{
                width: '300px'
              }} />
            </li>,
          )
        }
        data.push(
          <li key='product-date'>
            <div className='product-detail'>有效期</div>
            <RangePicker onChange={this.changeDateRange} />
          </li>)
      }
    } else {
      data.push(
        <li>
          <div className='product-detail'>产品图片</div>
          <Upload
            className="avatar-uploader"
            listType='text'
            data={uploadData}
            showUploadList={false}
            action="http://upload.qiniu.com/"
            beforeUpload={this.beforeUpload.bind(this)}
            onChange={this.handleChange.bind(this)}
          >
            {
              imageUrl ?
                <img src={imageUrl} alt="" className="avatar-product" /> :
                <Icon type="plus" style={{ fontSize: '30px' }} />
            }
          </Upload>
        </li>
      )
    }
    data.push(
      <li key='product-price'>
        <div className='product-detail'>实付价格</div>
        <Input onChange={(e) => {
          cacheProduct.price = e.target.value
          this.setState({
            cacheProduct
          })
        }} value={cacheProduct.price} style={{
          width: '300px'
        }} />
      </li>,
      <li key='product-description'>
        <div className='product-detail'>产品描述</div>
        <Input onChange={(e) => {
          cacheProduct.description = e.target.value
          this.setState({
            cacheProduct
          })
        }} value={cacheProduct.description || ''} style={{
          width: '300px'
        }} />
      </li>
    )
    return data
  }

  changeDateRange(date, dateString) {
    const startsAt = new Date(dateString[0])
    const expiresAt = new Date(dateString[1])
    let cacheProduct = this.state.cacheProduct
    cacheProduct.startsAt = startsAt
    cacheProduct.expiresAt = expiresAt
    this.setState({
      cacheProduct
    })
  }

  createSome() {
    let branch = []
    const { title, visible, newCategoryName, cacheProduct, type } = this.state
    let disabled = false
    if (title == '创建新分类') {
      branch.push([
        <Col span={6}>分类名称</Col>,
        <Col span={12}>
          <Input placeholder="分类名称" value={newCategoryName} onChange={(e) => { this.setState({ newCategoryName: e.target.value }) }} />
        </Col>
      ])
      if (newCategoryName == '') {
        disabled = true
      }
    } else if (title == '创建新产品') {
      branch.push(
        <ul key='create-new-product-detail' className='product-create'>
          <li>
            <div className='product-detail'>设置分类</div>
            <Select style={{
              width: '300px'
            }} onChange={(value) => {
              const chooseCategory = this.props.data.productCategorys.find((item) => {
                return item.id == value
              })
              this.setState({
                type: chooseCategory
              })
            }
            }>
              {
                this.props.data.productCategorys.map((item) => {
                  return <Select.Option key={item.id} value={item.id}>{item.productCategoryDetail[0].category}</Select.Option>
                })
              }
            </Select>
          </li>
          {this.setAttribute()}
        </ul>
      )
      if (!cacheProduct.name || !cacheProduct.price || !type) {
        disabled = true
      } else if (type.productCategoryDetail && type.productCategoryDetail[0].category == '会卡') {
        if (!cacheProduct.startsAt || !cacheProduct.expiresAt || (cacheProduct.accessType == 'multiple' && !cacheProduct.available)) {
          disabled = true
        }
      }
    }
    return <Modal
      visible={true}
      title={title}
      footer={
        [<Button key="cancel" onClick={this.handleCancel}>取消</Button>,
        <Button key="determine" disabled={disabled} onClick={this.handleOk}>确定</Button>]
      }
    >
      <Row style={{ padding: '10px', fontSize: '13px' }} >
        {branch}
      </Row>
    </Modal>
  }

  async setAvailable() {
    let cacheProducts = this.state.cacheProducts
    let series = cacheProducts.map((item) => {
      return async (callback) => {
        let data = {}
        try {
          data = await client.product.setAvailable(item)
        } catch (err) {
          return callback(err, null)
        }
        return callback(null, data)
      }
    })
    async.series(series,
      (err, result) => {
        if (err) {
          console.log(err)
        }
        this.setState({
          cacheProducts: []
        });
      }
    )
  }

  async unsetAvailable(){
    let cacheProducts = this.state.cacheProducts
    let series = cacheProducts.map((item) => {
      return async (callback) => {
        let data = {}
        try {
          data = await client.product.setUnavailable(item)
        } catch (err) {
          return callback(err, null)
        }
        return callback(null, data)
      }
    })
    async.series(series,
      (err, result) => {
        if (err) {
          console.log(err)
        }
        this.setState({
          cacheProducts: []
        });
      }
    )
  }

  render() {
    const { viewModel, visible, newCategoryName, defaultCategory, title, isCategoryEdit, isCheck, allChoose } = this.state
    return (
      <Layout>
        <Sider
          width={200} style={{ background: '#fff', borderRight: "1px solid #d9d9d9" }}
        >
          <div style={{ textAlign: "center", margin: "10px 0", height: '5vh', lineHeight: '5vh' }}>
            <Search
              placeholder="请输入文本"
              style={{ width: 150 }}
              onSearch={value => console.log(value)}
            />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={[defaultCategory.id]}
            style={{
              height: '85vh',
              overflowY: 'auto'
            }}
            onClick={this.handleClick}
          >
            {
              this.props.data.productCategorys.map((item) => {
                return <Menu.Item key={item.id}>{item.productCategoryDetail[0].category}</Menu.Item>
              })
            }
          </Menu>
        </Sider>
        <Layout style={{ height: '90vh', width: '80vh' }}>
          <Header style={{ background: "#ececec", padding: 0, height: '5vh', lineHeight: '5vh', margin: '10px 0' }} >
            <h2 style={{ width: '120px', fontSize: "20px", paddingLeft: "16px", float: 'left' }}>
              {isCategoryEdit ?
                <Input
                  defaultValue={defaultCategory.productCategoryDetail[0].category}
                  onBlur={(e) => {
                    defaultCategory.productCategoryDetail[0].category = e.target.value
                    this.setState({
                      isCategoryEdit: false,
                      defaultCategory
                    })
                  }} />
                : defaultCategory.productCategoryDetail[0].category}
            </h2>
            <Button icon='edit' onClick={() => {
              let isCategoryEdit = this.state.isCategoryEdit
              this.setState({
                isCategoryEdit: !isCategoryEdit
              })
            }} style={{ marginLeft: '10px', background: '#94928c', color: 'white' }}>编辑</Button>
            <Button onClick={() => {
              this.setState({
                isCheck: !isCheck
              })
            }}>批量管理</Button>
            {
              isCheck ?
                [
                  <Button onClick={() => {
                    let cacheProducts = []
                    if (!allChoose) {
                      defaultCategory.product.map((item) => {
                        if (!item.deletedAt) {
                          cacheProducts.push(item.id)
                        }

                      })
                    }
                    this.setState({
                      allChoose: !allChoose,
                      cacheProducts
                    })
                  }}>全选</Button>,
                  <Button onClick={this.setAvailable}>上架</Button>,
                  <Button onClick={this.unsetAvailable}>下架</Button>
                ] : ''
            }
          </Header>
          <Content style={{ margin: '0 16px', height: '85vh' }} >
            <div style={{ float: 'left', width: '95%', height: '100%' }}>
              {this.showProduct()}
            </div>
            <div style={{
              position: 'fixed',
              float: 'right',
              right: 100,
              height: '100%',
              width: '40px',
            }}>
              {
                viewModel ? [<Anchor key='create-new-category' type='appstore-o' value='添加分类' onClick={() => this.setState({ visible: true, title: "创建新分类" })} style={{
                  bottom: 240
                }} />,
                <Anchor key='create-new-product' type='gift' value='添加产品' onClick={() => this.setState({ visible: true, title: "创建新产品" })} style={{
                  bottom: 170
                }} />] : ''
              }
              <Anchor type='plus' value='添加' style={{
                bottom: 100
              }} onClick={this.showCreate} />
            </div>
            {visible ? this.createSome() : ''}
          </Content>
        </Layout>
      </Layout>
    )
  }
}
