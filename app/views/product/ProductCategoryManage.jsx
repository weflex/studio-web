import React, { Component } from 'react';
import { Tabs, Input, Popconfirm, Layout, Table } from 'antd'
import SetTopColumns from './components/SetTopColumns'
import AddProductCategory from './components/AddProductCategory'
import { client } from '../../api';
import './index.css'
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

class ProductCategoryManage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: 'productCategorys',
      data: this.props.data
    }
    this.cacheData = this.props.data.map(item => ({ ...item }));
  }

  get columns() {
    return [{
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text, record) => this.renderColumns(text, record, 'name'),
    }, {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '25%',
    }, {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: '25%',
    }, {
      title: '操作',
      dataIndex: '',
      key: 'x',
      width: '25%',
      render: (text, record) => {
        const { editable } = record;
        return (
          <span>
            {
              editable ?
                <span>
                  <a style={{ marginRight: '8px' }} onClick={() => this.save(record.id)}>保存</a>
                  <Popconfirm title="是否取消编辑?" onConfirm={() => this.cancel(record.id)}>
                    <a>取消</a>
                  </Popconfirm>
                </span>
                : <a onClick={() => this.edit(record.id)}>编辑</a>
            }
            <span className="ant-divider" />
            <Popconfirm title="是否删除?" onConfirm={() => {
              const { name } = this.state
              this.props.delData(name, record.id)
            }}>
              <a>删除</a>
            </Popconfirm>
          </span>
        )
      }
    }]
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

  handleChange(value, key, column) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target[column] = value;
      this.setState({ data: newData });
    }
  }

  edit(key) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target.editable = true;
      this.setState({ data: newData });
    }
  }

  save(key) {
    const newData = [...this.state.data];
    const editData = this.props.editData
    const name = this.state.name
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      delete target.editable;
      editData(name, newData)
      this.cacheData = newData.map(item => ({ ...item }));
    }
  }

  cancel(key) {
    const newData = [...this.state.data];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      Object.assign(target, this.cacheData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.setState({ data: newData });
    }
  }

  get config() {
    return {
      name: '创建新分类'
    }
  }

  newProductCategory() {
    return (
      <AddProductCategory addOne={this.props.addData} style={{ float: 'right', marginRight: 10 }} buttonName={this.config.name} />
    )
  }
  render() {
    return (
      <Layout>
        <Header>
          <SetTopColumns config={this.config} extra={this.newProductCategory()} />
        </Header>
        <Content>
          <div style={{ background: 'white', padding: '30px' }}>
            <Table rowKey={record => record.id} columns={this.columns} dataSource={this.props.data} pagination={{ pageSize: 10 }} />
          </div>
        </Content>
      </Layout>
    )
  }
}

module.exports = ProductCategoryManage;