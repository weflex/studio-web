import React, { Component } from 'react';
import {
  Layout, Row, Col, Badge, Spin, InputNumber,
  Button, Icon, Card, Input, Menu, Modal, Select, DatePicker, Upload, Checkbox, Popconfirm
} from 'antd';
import { client } from '../../api'
import './index.css'
import Anchor from './components/Anchor'
import ramda from 'ramda'
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
      defaultCategory: this.props.data.defaultCategory,
      viewModel: false,
      visible: false,
      refs: {},
      newCategoryName: '',
      classPackages: [],
      type: '',
      classPackageItem: {},
      cacheProduct: {},
      isCategoryEdit: false,
      isCheck: false,
      cacheProducts: [],
      allChoose: false,
      loading: false,
      imageUrl:'',
      editProduct: {}
    }
    this.showProduct = this.showProduct.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.showCreate = this.showCreate.bind(this)
    this.setAttribute = this.setAttribute.bind(this)
    this.addData = this.addData.bind(this)
    this.unsetAvailable = this.unsetAvailable.bind(this)
    this.setAvailable = this.setAvailable.bind(this)
    this.confirm = this.confirm.bind(this)
    this.delAll = this.delAll.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      defaultCategory: nextProps.data.defaultCategory,
      viewModel: false,
      visible: false,
      refs: {},
      newCategoryName: '',
      classPackages: [],
      type: '',
      chooseProductCategory: '',
      classPackageItem: {},
      cacheProduct: {},
      isCategoryEdit: false,
      isCheck: false,
      cacheProducts: [],
      allChoose: false,
      loading: false,
      editProduct: {},
      imageUrl:''
    })
  }

  async componentDidMount() {
    try {
      const venue = await client.user.getVenueById();
      const user = await client.user.getCurrent();
      const token = await client.resource.token();
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
        uptoken: token.uptoken,
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

  async delAll() {
    let { cacheProducts, defaultCategory } = this.state
    let series = cacheProducts.map((item) => {
      return async (callback) => {
        let data = {}
        try {
          data = await client.product.delete(item)
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
        this.props.getData(defaultCategory.id)
      }
    )
  }

  async confirm(id) {
    const defaultCategory = this.state.defaultCategory
    try {
      await client.product.delete(id)
      this.props.getData(defaultCategory.id)
    } catch (err) {
      console.log(err)
    }
  }

  showProduct() {
    const category = this.state.defaultCategory
    const isCheck = this.state.isCheck
    const cacheProducts = this.state.cacheProducts
    const editProduct = this.state.editProduct
    let col = []
    let products = category.product
    products.map((item) => {
      let checked = cacheProducts.includes(item.id)
      if (!item.deletedAt) {
        col.push(
          <Col key={item.id} style={{ margin: '0 0 10px 0' }} xs={24} sm={24} md={24} lg={10} xl={6}>
            {
              isCheck && !item.isEdit ? <Checkbox
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
                  {item.isEdit ? <Input defaultValue={editProduct[item.id].productDetail[0].productName}
                    onChange={(e) => {
                      let newProductName = e.target.value
                      editProduct[item.id].productDetail[0].productName = newProductName
                      this.setState({
                        editProduct
                      })
                    }}
                  /> :
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 'bold'
                    }}>{item.productDetail[0].productName}</span>
                  }
                </p>
                {
                  item.isEdit ? <div className='product-card'>￥<InputNumber min={0} style={{ width: 100 }} value={editProduct[item.id].productPricing[0].unitPrice}
                    onChange={(value) => {
                      let newunitPrice = value
                      editProduct[item.id].productPricing[0].unitPrice = newunitPrice
                      this.setState({
                        editProduct
                      })
                    }}
                  /> </div> : <p className='product-card' >￥<span>{item.productPricing[0].unitPrice}</span></p>
                }
                <p style={{
                  fontSize: '13px',
                  width: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={item.productDetail[0].productDescription} >
                  {
                    item.isEdit ? <Input defaultValue={editProduct[item.id].productDetail[0].productDescription}
                      onChange={(e) => {
                        let newproductDescription = e.target.value
                        editProduct[item.id].productDetail[0].productDescription = newproductDescription
                        this.setState({
                          editProduct
                        })
                      }}
                    /> : item.productDetail[0].productDescription
                  }
                </p>
                <p style={{ fontSize: '15px', position: 'relative', bottom: '-24px' }}>
                  {
                    item.isAvailable ? <Badge status="success" text='已上架' /> : <Badge status="error" text='已下架' />
                  }
                </p>
                <div style={{ position: 'absolute', bottom: '10px' }}>
                  {
                    item.isEdit ? '' : <Popconfirm placement="topRight" title={text} onConfirm={() => this.confirm(item.id)} okText="Yes" cancelText="No">
                      <Button>删除</Button>
                    </Popconfirm>
                  }
                </div>
              </div>
              <div style={{ float: "right", width: 150 }}>
                <img width={150} height={145} src={item.imgUrl} />
                {
                  item.isAvailable ? '' : (
                    item.isEdit ? '' :
                      <Button
                        onClick={() => {
                          item.isEdit = true
                          editProduct[item.id] = ramda.clone(item)
                          this.setState({
                            defaultCategory: category,
                            editProduct
                          })
                        }}
                        style={{ float: 'right' }}>编辑</Button>)
                }
              </div>
            </Card >
            {item.isEdit ? <div
              style={{
                width: '349px',
                background: 'white',
                position: 'relative',
                bottom: '23px',
              }}>
              <div className="option-split"></div>
              <Button style={{
                left: '11px',
                position: 'relative',
                bottom: '11px',
              }} type="primary" onClick={async () => {
                const updateProduct = editProduct[item.id]
                delete updateProduct.productCategory
                const result = await client.product.update(updateProduct.id, updateProduct, updateProduct.modifiedAt)
                item.isEdit = false
                delete editProduct[item.id]
                this.setState({
                  defaultCategory: category
                })
                this.props.getData(category.id)
              }}>确定</Button>
              <Button
                style={{
                  left: '11px',
                  position: 'relative',
                  bottom: '11px',
                }}
                onClick={() => {
                  item.isEdit = false
                  delete editProduct[item.id]
                  this.setState({
                    editProduct,
                    defaultCategory: category
                  })
                }}>取消</Button>
            </div> : ''}
          </Col>)
      }
    })
    return <Row gutter={24} >{col}</Row>
  }

  async addData(e) {
    const { newCategoryName, categoryName, cacheProduct, type, chooseCategory, classPackageItem, venueId, user, brandId, defaultCategory ,imageUrl} = this.state
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
        this.props.getData(defaultCategory.id)
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
        lifetime: cacheProduct.lifetime,
        packageId: cacheProduct.packageId,
        salesId: cacheProduct.salesId,
      }
      if (cacheProduct.accessType == 'multiple') {
        productAttribute.available = cacheProduct.available
      }
      detail.attributes = productAttribute
      const product = await client.product.create({
        imgUrl: imageUrl || 'http://assets.theweflex.com/cardviews/' + classPackageItem.color.substr(1) + '.png',
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
      if (chooseCategory.id != '1') {
        const productCategoryProduct = await client.productCategoryProduct.request(
          '',
          'post',
          {
            productId: product.id,
            productCategoryId: chooseCategory.id
          }
        )
      }
      this.props.getData(defaultCategory.id)
    }
    this.setState(
      {
        type: '',
        cacheProduct: {},
        chooseCategory: '',
        classPackageItem: {},
        newCategoryName: '',
        visible: false
      }
    );
  }
  handleCancel = () => {
    this.setState(
      {
        cacheProduct: '',
        type: '',
        chooseCategory: '',
        classPackageItem: {},
        newCategoryName: '',
        visible: false
      }
    );
  }

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
    const { type, chooseCategory, classPackage, classPackageItem, cacheProduct, imageUrl } = this.state
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
    if (type == '00') {
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
              description: classPackageItem.description,
              lifetime: {
                value: classPackageItem.lifetime.value,
                scale: classPackageItem.lifetime.scale,
              }
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
        if (classPackageItem.lifetime) {
          const selectAfter = (
            <Select defaultValue={cacheProduct.lifetime.scale} style={{ width: 70 }} onChange={(value) => {
              let scale = ''
              switch (value) {
                case '1':
                  scale = 'day'
                case '2':
                  scale = 'month'
                case '3':
                  scale = 'year'
                default:
                  scale = 'day'
              }
              cacheProduct.lifetime.scale = scale
              this.setState({
                cacheProduct
              })
            }} >
              <Option value="day">天</Option>
              <Option value="month">月</Option>
              <Option value="year">年</Option>
            </Select>
          );
          data.push(
            <li key='product-date'>
              <div className='product-detail'>有效期</div>
              <Input onChange={(e) => {
                const value = e.target.value
                cacheProduct.lifetime.value = parseInt(value)
                this.setState({
                  cacheProduct
                })
              }} addonAfter={selectAfter} value={cacheProduct.lifetime.value} style={{
                width: 300
              }} />
            </li>)
        }
      }
    } else if (type == '01') {
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
    if (type != '') {
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
    }
    return data
  }

  createSome() {
    let branch = []
    const { title, visible, newCategoryName, cacheProduct, type, chooseCategory } = this.state
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
                chooseCategory: chooseCategory
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
          <li>
            <div className='product-detail'>选择产品类型</div>
            <Select style={{
              width: '300px'
            }} onChange={(value) => {
              this.setState({
                type: value
              })
            }}>
              <Select.Option key='00' value='00'>会卡</Select.Option>
              <Select.Option key='01' value='01'>其他</Select.Option>
            </Select>
          </li>
          {this.setAttribute()}
        </ul>
      )
      if (!cacheProduct.name || !cacheProduct.price || !type || !chooseCategory) {
        disabled = true
      } else if (chooseCategory.productCategoryDetail && chooseCategory.productCategoryDetail[0].category == '会卡') {
        if (!cacheProduct.lifetime || (cacheProduct.accessType == 'multiple' && !cacheProduct.available)) {
          disabled = true
        }
      }
    }
    return <Modal
      visible={true}
      title={title}
      footer={
        [<Button key="cancel" onClick={this.handleCancel}>取消</Button>,
        <Button key="determine" disabled={disabled} onClick={this.addData}>确定</Button>]
      }
    >
      <Row style={{ padding: '10px', fontSize: '13px' }} >
        {branch}
      </Row>
    </Modal>
  }

  async setAvailable() {
    let cacheProducts = this.state.cacheProducts
    let defaultCategory = this.state.defaultCategory
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
        this.props.getData(defaultCategory.id)
      }
    )
  }

  async unsetAvailable() {
    let { cacheProducts, defaultCategory } = this.state
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
        this.props.getData(defaultCategory.id)
      }
    )
  }

  render() {
    const { viewModel, loading, visible, newCategoryName, defaultCategory, title, isCategoryEdit, isCheck, allChoose } = this.state
    return (
      <Spin spinning={loading}>
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
                    onBlur={async (e) => {
                      const category = e.target.value
                      if (defaultCategory.id != '1') {
                        defaultCategory.productCategoryDetail[0].category = category
                        this.setState({
                          loading: true
                        })
                        let item = Object.assign({}, defaultCategory)
                        delete item.product
                        await client.productCategory.request(
                          `${defaultCategory.id}`,
                          'put',
                          item)
                        this.props.getData(defaultCategory.id)
                      }
                      this.setState({
                        isCategoryEdit: false,
                        loading: false
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
                    <Button key='11' onClick={() => {
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
                    <Button key='12' onClick={this.setAvailable}>上架</Button>,
                    <Button key='13' onClick={this.unsetAvailable}>下架</Button>,
                    <Button key='14' onClick={this.delAll}>删除</Button>
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
      </Spin>
    )
  }
}
