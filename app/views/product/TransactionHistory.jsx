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
  }

  get columns() {
    return [{
      title: '订单号',
      dataIndex: 'id',
      width: '10%',
      render: (text, record) => { return record.id.substring(record.id.length - 8) },
    }, {
      title: '创建时间',
      dataIndex: 'boughtAt',
      width: '15%',
      render: (text, record) => { return (new Date(record.boughtAt)).toLocaleString() },
    }, {
      title: '创建者',
      dataIndex: 'userBought.members[0].nickname',
      width: '10%',
    },
    {
      title: '金额',
      dataIndex: 'totalPrice',
      width: '10%',
    }
      , {
      title: '方式',
      dataIndex: 'paymentType.paymentType.method',
      width: '10%',
    }, {
      title: '状态',
      dataIndex: 'transactionStatus.transactionStatusDetail[0].status',
      width: '10%',
    }, {
      title: '操作',
      dataIndex: '',
      key: 'x',
      width: '15%',
      render: (text, record) => {
        const { editable } = record;
        return (
          <span>
            <a>查看</a>
          </span>
        )
      }
    }]
  }

  newTransctionHistory() {
    return (
      <Button style={{ float: 'right', marginRight: 10, top: '15px' }}>新增订单</Button>
    )
  }

  getTransactionDetail(){
    const columns = [
      { title: 'Date', dataIndex: 'date', key: 'date' },
      { title: 'Date', dataIndex: 'date', key: 'date' },
      { title: 'Date', dataIndex: 'date', key: 'date' },
    ]
  }

  render() {
    console.log(this.props.data)
    return (
      <Layout>
        <Header>
          <SetTopColumns config={this.config} />
        </Header>
        <Content>
          <div style={{ background: 'white', padding: '30px' }}>
            <Table 
            expandedRowRender={} 
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
