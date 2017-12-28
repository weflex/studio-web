import QRCode from 'qrcode.react';
import React from 'react';
import { client } from '../../../api';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Switch, Icon, Input, Button, InputNumber, Layout, Menu, Breadcrumb } from 'antd';
import { Option } from '../components/Option'
import UIFramework from '@weflex/weflex-ui';
const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venue: {
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
  }
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const org = await client.org.get(venue.orgId, {
      include: [
        {
          'members': ['roles']
        },
      ]
    });
    const venueId = await client.user.getVenueById().id;
    await this.setState({
      venue,
      owner: this.getOwner(org.members),
      wechatURL: 'http://booking.theweflex.com/venues/' + venueId + '/classes'
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
    for(let i = 0 ; i < props.length;i++){
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
    const newVenue = Object.assign(venue, form)
     try {
      await client.venue.upsert(newVenue);
    } catch (err) {
      console.log(err)
    }
    this.setState({
      edit: false
    })
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

  form(e) {
    let form = this.state.form
    let { title, value } = e.target
    form[title] = value
    this.setState({
      form
    })
  }
  render() {
    const venue = this.state.venue
    return (
      <Layout style={{ height: '100%' }}>
        <Content className="venue-two-panel" style={{ padding: '0 50px', marginTop: 64, minWidth: 1240 }}>
          <div className="left-panel" >
            <div className="wf-panel">
              <div className="venue-setting" >场馆详情
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
                      <label >地址</label>
                    </div>
                    <div className="option-input">
                      {this.state.edit ? <Input defaultValue={venue.address} title='address' onBlur={this.form} /> : <p>{venue.address}</p>}
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
              <div>场馆二维码</div>
              <div className="Qrcode">
                <QRCode value={this.state.wechatURL+"?checkIns=1"} />
              </div>
              <Button icon="download" size={this.state.size} onClick={this.onClick}>下载二维码</Button>
            </div>
            <Option venue={venue} />
          </div>
        </Content>

      </Layout>
    )
  }
}
module.exports = Venue;
