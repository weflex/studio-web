import React, { Component } from 'react';
import { Tabs, Input, Popconfirm, Layout, Table, Button } from 'antd'
import SetTopColumns from './components/SetTopColumns'
import { client } from '../../api';
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

export default class extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
    this.getTransactionDetail = this.getTransactionDetail.bind(this)
  }

  get columns() {
    return [{
      title: '订单号',
      dataIndex: 'id',
      width: '20%',
      render: (text, record) => { return record.id.substring(record.id.length - 8) },
    }, {
      title: '创建时间',
      dataIndex: 'boughtAt',
      width: '20%',
      render: (text, record) => { return (new Date(record.boughtAt)).toLocaleString() },
    }, {
      title: '购买者',
      dataIndex: 'userBought.members[0].nickname',
      width: '15%',
    }, {
      title: '方式',
      dataIndex: 'paymentType.paymentType.method',
      width: '15%',
    },
    {
      title: '总金额',
      dataIndex: 'totalPrice',
      width: '15%',
    }, {
      title: '状态',
      dataIndex: 'transactionStatus.transactionStatusDetail[0].status',
      width: '15%',
    }]
  }

  newTransctionHistory() {
    return (
      <Button style={{ float: 'right', marginRight: 10, top: '15px' }}>新增订单</Button>
    )
  }

  getTransactionDetail(record) {
    const columns = [
      {
        title: '产品图片',
        dataIndex: 'product.imgUrl',
        width: '15%',
        render: (item) => {
          return (
            <img width={50} height={50} src={item} />
          )
        }
      },
      {
        title: '产品名称',
        width: '15%',
        dataIndex: 'product.productDetail[0].productName',
      },
      {
        title: '产品详情',
        width: '25%',
        dataIndex: 'product.productDetail[0].productDescription',
      },
      {
        title: '产品数量',
        width: '15%',
        dataIndex: 'quantity',
      },
      {
        title: '产品单价',
        width: '15%',
        dataIndex: 'productPricing.unitPrice',
      },
      {
        title: '产品总价',
        width: '15%',
        dataIndex: 'subTotal',
      },
    ]
    return (
      <Table
        rowKey={record => record.id}
        columns={columns}
        dataSource={record.transactionDetail}
        pagination={false}
      />
    )
  }

  render() {
    return (
      <Layout>
        <Header>
          <SetTopColumns config={this.config} />
        </Header>
        <Content>
          <div style={{ background: 'white', padding: '30px' }}>
            <Table
              scroll={{ x: '80vw', y: '60vh' }}
              expandedRowRender={this.getTransactionDetail.bind(this)}
              rowKey={record => record.id}
              columns={this.columns}
              dataSource={this.props.data}
              pagination={{ pageSize: 10 }} />
          </div>
        </Content>
      </Layout>
    )
  }
}
