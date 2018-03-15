import 'babel-polyfill';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd'
import React from 'react';
import ReactDOM from 'react-dom';
import { client } from '../api';
import options from '../views/settings/components/cascader-address-options'
import '../layout/new-root-center.css';
const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;

class RegistrationForm extends React.Component {
  state = {
    confirmDirty: false,
    address: [],
    countdown: -1,
  };

  async onRequestSMSCode() {
    if(this.state.countdown < 0){
      this.startCountdown()
      const phone = this.props.form.getFieldValue('phone')
      try {
        await client.user.smsRequest(phone);
      } catch (err) {
        this.stopCoutdown()
        alert(err && err.message);
      }
    }
  }

  handleSubmit = (e) => {
    let address = this.state.address
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        address[0] = values.address
        try {
          await client.user.smsRegisterNewOrgAndVenue(
            values.phone,
            values.smsCode,
            {
              venueName: values.Vname,
              username: values.Uname,
              address: address,
              password: values.password,
              nickname: values.nickname
            }
          );
          window.location.href = '/calendar';
        } catch (err) {
          alert(err && err.message + ', please contact: 400-8566-203');
        }
      }
    });
  }

  startCountdown() {
    this.setState({
      countdown: 30
    })
    this.interval = setInterval(() => {
      this.setState({
        countdown: this.state.countdown - 1
      })
      if (this.state.countdown < 0) {
        this.stopCoutdown()
      }
    }, 1000)
  }

  stopCoutdown() {
    this.setState({
      countdown: -1
    })
    clearInterval(this.interval)
  }


  setAddress(value, selectedOptions) {
    const area = selectedOptions.map(o => o.label).join(' ')
    let address = []
    address[1] = area
    address[2] = value.toString()
    this.setState({
      address
    })
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }
  checkUserName = async (rule, value, callback) => {
    const isNew = await client.middleware('/search/checkName', {
      username: value
    })
    if (!isNew) {
      callback('此用户名已被使用');
    } else {
      callback();
    }
  }
  checkVenueName = async (rule, value, callback) => {
    const isNew = await client.middleware('/search/checkName', {
      venuename: value
    })
    if (!isNew) {
      callback('此场馆吗已被使用');
    } else {
      callback();
    }
  }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { autoCompleteResult,countdown } = this.state;

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
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };
    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '86',
    })(
      <Select style={{ width: 60 }}>
        <Option value="86">+86</Option>
      </Select>
    );


    return (
      <div className="box-container">
        <div className="box signup">
          <h1>注册工作室</h1>
          <div className="contents">
            <Form onSubmit={this.handleSubmit}>
              <FormItem
                {...formItemLayout}
                label="场馆名称"
              >
                {getFieldDecorator('Vname', {
                  rules: [{
                    required: true, message: '请输入场馆名称!'
                  },
                  {
                    validator: this.checkVenueName
                  }],
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="登录账号"
                hasFeedback
              >
                {getFieldDecorator('Uname', {
                  rules: [{
                    type: 'string', min: 4, max: 16, message: '登录账号格式错误,账号长度确保4-16位!',
                  }, {
                    required: true, message: '请输出登录账号!',
                  }, {
                    validator: this.checkUserName,
                  }],
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="登录密码"
                hasFeedback
              >
                {getFieldDecorator('password', {
                  rules: [{
                    required: true, message: '请输入密码!',
                  }, {
                    type: 'string', min: 8, max: 16, message: '密码长度确保8-16位!',
                  }, {
                    validator: this.checkConfirm,
                  }],
                })(
                  <Input type="password" />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="确认密码"
                hasFeedback
              >
                {getFieldDecorator('confirm', {
                  rules: [{
                    required: true, message: '请确认密码!',
                  }, {
                    validator: this.checkPassword,
                  }],
                })(
                  <Input type="password" onBlur={this.handleConfirmBlur} />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={(
                  <span>
                    昵称&nbsp;
              <Tooltip title="你想要别人如何称呼你?">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
                hasFeedback
              >
                {getFieldDecorator('nickname', {
                  rules: [{ required: true, message: '请输入你的昵称!', whitespace: true }],
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="选择地区"
              >
                {getFieldDecorator('residence', {
                  rules: [{ type: 'array', required: true, message: '请选择你所在的地址!' }],
                })(
                  <Cascader options={options} onChange={this.setAddress.bind(this)} />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="详细地址"
                hasFeedback
              >
                {getFieldDecorator('address', {
                  rules: [{
                    required: true, type: 'string', message: '请输入详细地址',
                  }],
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="联系电话"
              >
                <Row>
                  <Col span={16}>
                    {getFieldDecorator('phone', {
                      rules: [{ type: 'string', required: true, len: 11, message: '请输入11位手机号!' }],
                    })(
                      <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
                    )}
                  </Col>
                  <Col span={8}>
                    <Button onClick={this.onRequestSMSCode.bind(this)}>{countdown < 0 ? '获取验证码' : `${countdown}s后重试`}</Button>
                  </Col>
                </Row>

              </FormItem>
              <FormItem
                {...formItemLayout}
                label="验证码"
              >
                {getFieldDecorator('smsCode', {
                  rules: [{ required: true, message: '请输入你获取的验证码!' }],
                })(
                  <Input size="large" />
                )}
              </FormItem>
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" style={{ width: '100%', background: 'rgb(110, 212, 164)', borderColor: 'rgb(110, 212, 164)' }}>创建场馆</Button>
              </FormItem>
            </Form>
          </div>
          <p className="login-link">已有账号？点击这里<a href="/login">登录</a></p>
        </div>
      </div>
    );
  }
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);

ReactDOM.render(<WrappedRegistrationForm />, document.getElementById('root-container'));
