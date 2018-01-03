import QRCode from 'qrcode.react';
import React from 'react';
import { client } from '../../../api';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Switch, Icon, Input, Button, InputNumber, Layout, Menu, Breadcrumb, Cascader } from 'antd';
import { Option } from '../components/Option'
import UIFramework from '@weflex/weflex-ui';
import options from '../components/cascader-address-options';
import _ from 'lodash';
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
      form: {}
    };
    this.EditBaseInfo = this.EditBaseInfo.bind(this)
    this.OnSave = this.OnSave.bind(this)
    this.OnCancel = this.OnCancel.bind(this)
    this.form = this.form.bind(this)
    this.setAddress = this.setAddress.bind(this)
    this.onComplete = this.onComplete.bind(this)
  }
  async componentWillMount() {
    const user = await client.user.getCurrent();
    const venue = await client.user.getVenueById();
    const org = await client.org.get(venue.orgId, {
      include: [
        {
          'members': ['roles']
        },
      ]
    });
    await this.setState({
      venue,
      owner: this.getOwner(org.members),
      wechatURL: 'http://booking.theweflex.com/venues/' + venue.id + '/classes'
    });
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
  render() {
    const venue = this.state.venue
    return (
      <Layout style={{ height: '100%' }}>
        <Content className="venue-two-panel" style={{ padding: '0 50px', marginTop: 64, minWidth: 1240 }}>
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
          </div>
        </Content>

      </Layout>
    )
  }
}
module.exports = Venue;
