import React from 'react'
import { Layout, Modal, Transfer, Icon, Table, Popconfirm, Badge, Input, Menu, Dropdown } from 'antd';
import SetTopColumns from './components/SetTopColumns'
import AddDiscount from './components/AddDiscount'
import NewDiscount from './components/NewDiscount'
import products from '../../../assets/data/products.json'
import './DiscountManage.css'
const { Header, Content } = Layout;

const EditableCell = ({ editable, value, onChange }) => {
  return (
    <div>
      {editable
        ? <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
        : value
      }
    </div>
  )
};

class DiscountManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
      name: 'discounts',
      visible: false,
      mockData: [],
      targetKeys: [],
    }
    this.cacheData = this.state.data.map(item => ({ ...item }));
  }

  showModal = (discountId) => {
    this.getMock(discountId)
    this.discountId = discountId
    this.setState({
      visible: true,
    });
  }
  handleOk = () => {
    const discountId = this.discountId
    let product = []
    const { data, targetKeys } = this.state
    let discount = data.find((item) => item.id == discountId)
    targetKeys.map((item) => {
      products.find((piece) => { return item == piece.id ? product.push(piece) : false })
    })
    discount.product = product
    this.setState({
      data,
      visible: false,
    });
  }
  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  expandedRowRender(record) {
    const columns = [
      {
        title: '产品名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => record.productDetail.productName,
      },
      {
        title: '产品代号',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '状态',
        key: 'state',
        render: () => <span><Badge status="success" />进行中</span>
      },
      {
        title: '创建者',
        dataIndex: 'createdBy',
        key: 'createdBy'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, product) => (
          <span className="table-operation">
            <Icon type="pause-circle-o" style={{ fontSize: 16, marginRight: 10 }} />
            <Popconfirm title="是否删除?" onConfirm={() => {
              const { name } = this.state
              this.props.delData(name, record.id, product.id)
            }}>
              <Icon type="delete" style={{ fontSize: 16, marginRight: 10 }} />
            </Popconfirm>
          </span>
        ),
      },
    ];
    const data = record ? record.product : [];
    return (
      <Table
        rowKey={record => record.id}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />
    );
  };

  get columns() {
    return [
      {
        title: '折扣名称',
        dataIndex: 'name',
        key: 'name',
        width: '10%',
        render: (text, record) => this.renderColumns(text, record, 'name'),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: '18%',
        render: (text, record) => { return (new Date(record.createdAt)).toLocaleString() },
      },
      {
        title: '结束时间',
        dataIndex: 'endAt',
        key: 'endAt',
        width: '18%',
        render: (text, record) => { return (new Date(record.endAt)).toLocaleString() },
      },
      {
        title: '会员优惠',
        dataIndex: 'memberPriceOff',
        key: 'memberPriceOff',
        width: '9%',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: '20%',
        render: (text, record) => this.renderColumns(text, record, 'description'),
      },
      {
        title: '创建者',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: '15%',
      },
      {
        title: '操作',
        key: 'operation',
        width: '15%',
        render: (text, record) => {
          const { editable } = record;
          return (
            <span>
              <span>
                <Icon type="plus" style={{ fontSize: '16px'}} onClick={() => this.showModal(record.id)} />
              </span>
              <span className="ant-divider" />
              {
                editable ?
                  <span>
                    <a style={{ marginRight: '8px' }} onClick={() => this.save(record.id)}>保存</a>
                    <Popconfirm title="是否取消编辑?" onConfirm={() => this.cancel(record.id)}>
                      <a>取消</a>
                    </Popconfirm>
                  </span>
                  : <Icon type="edit" style={{ fontSize: 16 }} onClick={() => this.edit(record.id)} />
              }
              <span className="ant-divider" />
              <Popconfirm title="是否删除?" onConfirm={() => {
                const { name } = this.state
                this.props.delData(name, record.id)
              }}>
                <Icon type="delete" style={{ fontSize: 16, marginRight: 10 }} />
              </Popconfirm>
            </span>
          )
        }
      },
    ]
  }

  renderColumns(text, record, column) {
    return (
      <EditableCell
        editable={record.editable}
        value={text}
        onChange={value => this.handleChange(value, record.id, column)}
      />
    );
  }

  handleChange(value, id, column) {
    const newData = [...this.state.data];
    const target = newData.filter(item => id === item.id)[0];
    if (target) {
      target[column] = value;
      this.setState({ data: newData });
    }
  }

  edit(id) {
    const newData = [...this.state.data];
    const target = newData.filter(item => id === item.id)[0];
    if (target) {
      target.editable = true;
      this.setState({ data: newData });
    }
  }

  save(id) {
    const newData = [...this.state.data];
    const target = newData.filter(item => id === item.id)[0];
    if (target) {
      delete target.editable;
      this.setState({ data: newData });
      this.cacheData = newData.map(item => ({ ...item }));
    }
  }

  cancel(id) {
    const newData = [...this.state.data];
    const target = newData.filter(item => id === item.id)[0];
    if (target) {
      Object.assign(target, this.cacheData.filter(item => id === item.id)[0]);
      delete target.editable;
      this.setState({ data: newData });
    }
  }

  get config() {
    return {
      name: '创建新折扣'
    }
  }

  newDiscount() {
    return (
      <NewDiscount style={{ float: 'right', marginRight: 10 }} buttonName={this.config.name} />
    )
  }

  getMock = (discountId) => {
    const data = this.state.data
    const targetKeys = [];
    const mockData = products;
    let index = data.find((item) => item.id == discountId)
    index.product.map((item) => {
      mockData.map((piece) => {
        return item.id == piece.id ? targetKeys.push(item.id) : false
      })
    })
    this.setState({ mockData, targetKeys });
  }
  filterOption = (inputValue, option) => {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange = (targetKeys) => {
    this.setState({ targetKeys });
  }

  render() {
    const { data } = this.state
    const config = {
      name: '创建新折扣'
    }
    return (
      <Layout>
        <Header>
          <SetTopColumns config={this.config} extra={this.newDiscount()} />
        </Header>
        <Content>
          <div style={{ background: 'white', padding: '30px' }}>
            <Table
              rowKey={record => record.id}
              className="components-table-demo-nested"
              columns={this.columns}
              expandedRowRender={this.expandedRowRender.bind(this)}
              dataSource={data}
              pagination={{ pageSize: 10 }}
            />
          </div>
        </Content>
        <Modal
          title="添加产品"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Transfer
            rowKey={record => record.id}
            dataSource={this.state.mockData}
            searchPlaceholder='请输入搜索内容'
            showSearch
            filterOption={this.filterOption}
            targetKeys={this.state.targetKeys}
            onChange={this.handleChange}
            render={item => item.productDetail.productName}
          />
        </Modal>
      </Layout>
    )
  }
}

module.exports = DiscountManage