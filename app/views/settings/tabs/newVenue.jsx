import QRCode from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import React from 'react';
import { client } from '../../../api';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DatePicker, Switch, Icon, Input, Button, InputNumber, Layout, Menu, Breadcrumb, Cascader } from 'antd';
import { Option } from '../components/Option'
import UIFramework from '@weflex/weflex-ui';
import options from '../components/cascader-address-options';
import _ from 'lodash';
import { addDays, format, isSameDay } from 'date-fns';
import moment from 'moment';
import { getTimeDistance } from '../components/untils';
const startOfDay = require('date-fns/start_of_day')
const endOfDay = require('date-fns/end_of_day')
const differenceInDays = require('date-fns/difference_in_days')
const { RangePicker } = DatePicker;
const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venue: {
        address: ["工作室地址", "上海市 市辖区 静安区", "31,3101,310106"],
        deadline: 0,
        remindMember: {
          isRemind: false,
          days: 7
        }
      },
      owner: {},
      wechatURL: '',
      edit: false,
      size: 'large',
      form: {},
      rangePickerValue: getTimeDistance('week'),
    };
    this.EditBaseInfo = this.EditBaseInfo.bind(this)
    this.OnSave = this.OnSave.bind(this)
    this.OnCancel = this.OnCancel.bind(this)
    this.form = this.form.bind(this)
    this.setAddress = this.setAddress.bind(this)
    this.onComplete = this.onComplete.bind(this)
    this.handleRangePickerChange = this.handleRangePickerChange.bind(this)
    this.getCheckIn = this.getCheckIn.bind(this)
    this.download = this.download.bind(this)
  }
  async componentWillMount() {
    const { rangePickerValue } = this.state
    const user = await client.user.getCurrent();
    const venue = await client.user.getVenueById();
    const org = await client.org.get(venue.orgId, {
      include: [
        {
          'members': ['roles']
        },
      ]
    });
    await this.getCheckIn(venue.id, rangePickerValue[0], rangePickerValue[1])
    await this.setState({
      venue,
      owner: this.getOwner(org.members),
      wechatURL: 'http://booking.theweflex.com/venues/' + venue.id + '/classes'
    });
  }

  async getCheckIn(venueId, startsAt, endsAt) {
    const days = differenceInDays(endsAt, startsAt)
    let data = new Array(days || 1)
    for (let i = 0; i < data.length; i++) {
      data[i] = {
        name: format(addDays(new Date(startsAt), i), 'MM-DD'),
        uv: 0
      }
    }
    const checkIn = await client.checkIn.list({
      where: {
        venueId: venueId,
        createdAt: {
          between: [startsAt, endsAt]
        }
      }
    })
    checkIn.map(item => {
      for (let i = 0; i < data.length; i++) {
        if (isSameDay(data[i].name, format(item.createdAt, 'MM-DD'))) {
          data[i].uv++
          break
        }
      }
    })
    await this.setState({
      data
    })
  }

  getOwner(members) {
    let owner;
    for (let member of members) {
      for (let role of member.roles) {
        if (role.name === '$owner') {
          owner = member;
          break;
        }
      }
      if (owner) {
        break;
      }
    }
    owner.display = owner.fullname.first + ' ' + owner.fullname.last;
    return owner;
  }

  EditBaseInfo() {
    this.setState({
      edit: true
    })
  }

  isErrTips(form) {
    let errorMessage = []
    const props = Object.keys(form)
    for (let i = 0; i < props.length; i++) {
      if (typeof form[props[i]] == 'undefined' || form[props[i]] == '') {
        if (props[i] == 'phone') {
          errorMessage.push(`电话`)
        } else if (props[i] == 'name') {
          errorMessage.push(`场馆名`)
        } else if (props[i] == 'address') {
          errorMessage.push(`地址`)
        }
      } else if (props[i] == 'phone' && (Number.isNaN(Number(form[props[i]])) || form[props[i]].length != 11)) {
        errorMessage.push(`手机号码必须为11位数字`)
      }
    }
    return errorMessage
  }

  async OnSave() {
    const { venue, form } = this.state
    const errorMessage = this.isErrTips(form)
    if (errorMessage.length > 0) {
      return UIFramework.Message.error('请正确输入:' + errorMessage.join('和') + '后确认保存。');
    }
    const newVenue = _.merge(venue, form)
    try {
      const result = await client.venue.update(newVenue.id, newVenue, newVenue.modifiedAt);
      this.setState({
        venue: result,
        edit: false
      })
      let user = client.user
      user.user = null
    } catch (err) {
      console.log(err)
    }
  }

  OnCancel() {
    this.setState({
      edit: false
    })
  }

  onClick() {
    const canvas = document.querySelector('.Qrcode > canvas');
    let download = document.createElement('a');
    let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    download.href = image;
    download.download = "场馆二维码.png";
    download.click()
  }

  setAddress(value, selectedOptions) {
    let { form, venue } = this.state
    const area = selectedOptions.map(o => o.label).join(' ')
    let address = form.address || []
    address[1] = area
    address[2] = value.toString()
    form.address = address
    this.setState({
      form
    })
  }

  form(e) {
    let form = this.state.form
    let { title, value } = e.target
    if (title == 'address') {
      let address = form.address || []
      address[0] = value
      form.address = address
    } else {
      form[title] = value
    }
    this.setState({
      form
    })
  }

  onComplete(venue) {
    this.setState({
      venue
    })

  }

  handleRangePickerChange(rangePickerValue) {
    const venue = this.state.venue
    this.getCheckIn(venue.id, rangePickerValue[0], rangePickerValue[1])
    this.setState({
      rangePickerValue,
    })
  }

  selectDate(type) {
    let a = document.querySelectorAll('.dateChange')
    for (let item of a) {
      if (item.title == type) {
        item.style.color = '#1890ff'
      } else {
        item.style.color = 'gray'
      }
    }
    const rangeDate = getTimeDistance(type)
    const venue = this.state.venue
    this.getCheckIn(venue.id, rangeDate[0], rangeDate[1])
    this.setState({
      rangePickerValue: getTimeDistance(type),
    });
  }

  renderCheckIn() {
    const { data, config } = this.state
    return (<div style={{ position: 'relative', right: '20px', top: '10px' }}>
      <LineChart width={560} height={200} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Line connectNulls={true} type='monotone' name='登记人数' dataKey='uv' stroke='rgba(0, 0, 0, 0.65)' fill='rgba(0, 0, 0, 0.65)' />
      </LineChart>
    </div>)
  }

  download() {
    const {venue,rangePickerValue} = this.state
    const accessToken = (JSON.parse(localStorage["weflex.user"])).accessToken
    let download = document.createElement('a');
    download.href = `api/venues/${venue.id}/classes/exportCheckIn?access_token=${accessToken}&startsAt=${format(rangePickerValue[0],'YYYY-MM-DD')}&endsAt=${format(rangePickerValue[1],'YYYY-MM-DD')}`
    download.download = "进店登记详情.xlsx";
    download.click()
  }

  render() {
    const { venue, venueCreatedAt, startsAt, endsAt, detailTime, config, rangePickerValue } = this.state
    return (
      <Layout style={{ height: '100%' }}>
        <Content className="venue-two-panel" style={{ padding: '0 50px', marginTop: 64, minWidth: 1240, background: '#ececec' }}>
          <div className="left-panel" >
            <div className="wf-panel">
              <div className="venue-setting" ><h3>场馆详情</h3>
                {this.state.edit ? '' : <a href="javascript:void(0);" onClick={this.EditBaseInfo} style={{ float: 'right', color: '#006eff' }}>编辑</a>}
              </div>
              <div>
                <ul className="option-message">
                  <li>
                    <div className="option-label">
                      <label >场馆名</label>
                    </div>
                    <div className="option-input">
                      {this.state.edit ? <Input defaultValue={venue.name} title='name' onBlur={this.form} /> : <p>{venue.name}</p>}
                    </div>
                  </li>
                  <li>
                    <div className="option-label">
                      <label >店长</label>
                    </div>
                    <div className="option-input">
                      <p>{this.state.owner.display}</p>
                    </div>
                  </li>
                  <li><div className="option-label">
                    <label >联系电话</label>
                  </div>
                    <div className="option-input">
                      {this.state.edit ? <Input defaultValue={venue.phone} title='phone' onBlur={this.form} /> : <p>{venue.phone}</p>}
                    </div>
                  </li>
                  <li>
                    <div className="option-label">
                      <label >所在地区</label>
                    </div>
                    <div className="option-input">
                      {this.state.edit ? <Cascader allowClear={false} defaultValue={venue.address.length == 0 ? ["11", "1101", "110112"] : venue.address[2].split(',')} options={options} style={{ width: 200 }} onChange={this.setAddress} /> : <p>{venue.address[1]}</p>}
                    </div>
                  </li>
                  <li>
                    <div className="option-label">
                      <label >详细地址</label>
                    </div>
                    <div className="option-input">
                      {this.state.edit ? <Input defaultValue={venue.address[0]} title='address' onBlur={this.form} /> : <p>{venue.address[0]}</p>}
                    </div>
                  </li>
                  <li>
                    <div className="option-label">
                      <label >会员订课网址</label></div>
                    <div className="option-input">
                      <p>{this.state.wechatURL}</p>
                    </div>
                  </li>
                  <li>
                    <div className="option-label">
                      <label >教练端网址</label></div>
                    <div className="option-input">
                      <p>http://trainer.theweflex.com</p>
                    </div>
                  </li>
                </ul>
              </div>
              {this.state.edit ? <div>
                <div className="option-split"></div>
                <Button type="primary" onClick={this.OnSave}>确定</Button> <Button onClick={this.OnCancel}>取消</Button>
              </div> : ''}
            </div>
          </div>
          <div className="right-panel">
            <div className="wf-panel" style={{ marginTop: 0 }}>
              <h3>场馆二维码</h3>
              <div className="Qrcode">
                <QRCode value={this.state.wechatURL + "?checkIns=1"} />
              </div>
              <Button icon="download" size={this.state.size} onClick={this.onClick}>下载二维码</Button>
            </div>
            <Option venue={venue} onComplete={this.onComplete} />
            <div className="wf-panel" style={{ marginTop: '20px' }} >
              <div>
                <h3 style={{ display: 'inline-block' }}>进店登记</h3>
                <div style={{ margin: '10px 0 10px 10px', display: 'inline-block' }}>
                  <a className='dateChange' title='today' onClick={() => this.selectDate('today')}>
                    今日
                </a>
                  <a className='dateChange' style={{ color: '#1890ff' }} title='week' onClick={() => this.selectDate('week')}>
                    本周
                </a>
                  <a className='dateChange' title='month' onClick={() => this.selectDate('month')}>
                    本月
                </a>
                </div>
                <RangePicker
                  allowClear={false}
                  value={rangePickerValue}
                  onChange={this.handleRangePickerChange}
                  style={{ width: 256 }}
                />
                <Button icon="download" onClick={this.download}>下载明细</Button>
              </div>
              {this.renderCheckIn()}
            </div>
          </div>
        </Content>
      </Layout>
    )
  }
}
module.exports = Venue;
