import React from 'react'
import { Modal, Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const config = [
  {
    id: '1',
    name: '减免折扣'
  },
  {
    id: '2',
    name: '百分比折扣'
  },
  {
    id: '3',
    name: '附带赠品'
  },
  {
    id: '4',
    name: '量贩满减'
  },
  {
    id: '5',
    name: '量贩打折'
  },
  {
    id: '6',
    name: '会员折扣'
  },
  {
    id: '7',
    name: '满额打折'
  },
  {
    id: '8',
    name: '满额减免'
  },
  {
    id: '9',
    name: '交易折扣'
  },
  {
    id: '10',
    name: '交易减免'
  },
  {
    id: '11',
    name: '团购'
  },
]
class RegistrationForm extends React.Component {
  state = {
    disabled:true,
    visible: false,
    confirmDirty: false,
    autoCompleteResult: [],
    value: '0',
    showOption: (new Array(9)).fill(false,0)
  };
 
  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
    // const addOne = this.props.addOne
    // const { newItem, name } = this.state
    // if (typeof addOne == 'function') {
    //   addOne(name, newItem)
    // }
    this.setState({ visible: false });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  onChange(value) {
    let showOption = this.state.showOption
    showOption.fill(false,0)
    switch (value.key) {
      case '1':
        showOption[1] = showOption[8] = true
        this.setState({ showOption })
        break;
      case '2':
        showOption[0] = showOption[8] = true
        this.setState({ showOption })
        break;
      case '3':
        showOption[9] = true
        this.setState({ showOption })
        break;
      case '4':
        showOption[1] = showOption[3] = showOption[8] = true
        this.setState({ showOption })
        break;
      case '5':
        showOption[0] = showOption[3] = showOption[8] = true
        this.setState({ showOption })
        break;
      case '6':
        showOption[2] = showOption[8] = true
        this.setState({ showOption })
        break;
      case '7':
        showOption[0] = showOption[4] = showOption[8] = true
        this.setState({ showOption })
        break;
      case '8':
        showOption[1] = showOption[4] = showOption[8] = true
        this.setState({ showOption })
        break;
      case '9':
        showOption[6] = true
        this.setState({ showOption })
        break;
      case '10':
        showOption[5] = true
        this.setState({ showOption })
        break;
      case '11':
        showOption[2] = showOption[3] = showOption[8] = true
        this.setState({ showOption })
        break;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { autoCompleteResult, showOption } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };

    const websiteOptions = autoCompleteResult.map(website => (
      <AutoCompleteOption key={website}>{website}</AutoCompleteOption>
    ));

    const { visible,disabled } = this.state
    return (
      <div style={this.props.style}>
        <Button onClick={this.showModal}>{this.props.buttonName}</Button>
        <Modal
          visible={visible}
          title={this.props.buttonName}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" size="large" onClick={this.handleCancel}>取消</Button>,
            <Button key="submit" type="primary" size="large" disabled={disabled} onClick={this.handleOk}>
              确定
            </Button>,
          ]}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  折扣名称&nbsp;
              <Tooltip title="当你创建一个优惠政策给用户时，需要一个名字">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}
              hasFeedback
            >
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入名称!', whitespace: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="折扣类型"
              hasFeedback
            >
              {getFieldDecorator('type', {
                initialValue: { key: '0' },
                rules: [{ required: true, message: '请选择折扣类型!' }],
              })(
                <Select labelInValue style={{ width: '100%' }} onChange={this.onChange.bind(this)}>
                  <Option value="0">无</Option>
                  {
                    config.map((item, key) => {
                      return <Option key={key} value={item.id}>{key + 1 +':'+item.name}</Option>
                    })
                  }
                </Select>
              )}
            </FormItem>
            {showOption[0] ? <FormItem
              {...formItemLayout}
              label="折率"
              hasFeedback
            >
              {getFieldDecorator('pctOfPrice', {
                rules: [
                  {
                    required: true,
                    message: '请输入折率!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[1] ? <FormItem
              {...formItemLayout}
              label="减免金额"
              hasFeedback
            >
              {getFieldDecorator('flatPrice', {
                rules: [
                  {
                    required: true,
                    message: '请输入减免金额!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[2] ? <FormItem
              {...formItemLayout}
              label="会员折率"
              hasFeedback
            >
              {getFieldDecorator('memberPriceOff', {
                rules: [
                  {
                    required: true,
                    message: '请输入会员折率!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[3] ? <FormItem
              {...formItemLayout}
              label="最小数量"
              hasFeedback
            >
              {getFieldDecorator('minQty', {
                rules: [
                  {
                    required: true,
                    message: '请输入最小数量!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[4] ? <FormItem
              {...formItemLayout}
              label="最低交易金额"
              hasFeedback
            >
              {getFieldDecorator('minTxnAmt', {
                rules: [
                  {
                    required: true,
                    message: '最低交易金额!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[5] ? <FormItem
              {...formItemLayout}
              label="全场减免"
              hasFeedback
            >
              {getFieldDecorator('flatPrice', {
                rules: [
                  {
                    required: true,
                    message: '请输入减免金额!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[6] ? <FormItem
              {...formItemLayout}
              label="全场折扣"
              hasFeedback
            >
              {getFieldDecorator('pctOfPrice', {
                rules: [
                  {
                    required: true,
                    message: '请输入折率!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[7] ? <FormItem
              {...formItemLayout}
              label="团购人数"
              hasFeedback
            >
              {getFieldDecorator('groupBuyAvailable', {
                rules: [
                  {
                    required: true,
                    message: '请输入最低交易金额!'
                  },
                  {
                    type: 'number',
                    message: '请输入数字!',
                    transform: value => +value
                  }
                ],
              })(
                <Input style={{ width: '100%' }} />
              )}
            </FormItem> : null}
            {showOption[8] ? <FormItem
              {...formItemLayout}
              label="产品选择"
              hasFeedback
            >
              {getFieldDecorator('product', {
                rules: [{ required: true, message: '请选择适用产品!' }],
              })(
                <AutoComplete
                  dataSource={websiteOptions}
                  onChange={this.handleWebsiteChange}
                  placeholder="产品"
                >
                  <Input />
                </AutoComplete>
              )}
            </FormItem> : null}
          </Form>
        </Modal>
      </div>
    );
  }
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);
module.exports = WrappedRegistrationForm