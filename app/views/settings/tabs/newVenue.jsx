import QRCode from 'qrcode.react';
import React from 'react';
import { client } from '../../../api';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Switch, Icon, Input, Button, InputNumber, Layout, Menu, Breadcrumb } from 'antd';
import { Option } from '../components/Option'
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
    };
    this.EditBaseInfo = this.EditBaseInfo.bind(this)
    this.OnSave = this.OnSave.bind(this)
    this.OnCancel = this.OnCancel.bind(this)
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
  async onSubmit() {
    mixpanel.track("我的设置：场馆-保存");
    let shouldRefresh = false;
    try {
      await client.venue.upsert(this.state.venue);
    } catch (err) {
      if (err.code === 'RESOURCE_EXPIRED') {
      }
    }
    if (!shouldRefresh) {
      location.reload();
    }
  }

  showText(event) {
    let venue = this.state
    venue.remindMember.isRemind = event;
    this.setState({
      venue
    })
  }

  swtch() {
    console.log(1)
    const remindMember = this.state.venue.remindMember
    return <ul className="option-message">
      <li>
        <div className="option-label" style={{ color: '#000' }}><label>会籍到期短信提醒</label></div>
        <div className="option-input" style={{ textAlign: "end" }}>
          <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={remindMember.isRemind} onChange={this.showText.bind(this)} />
        </div>
      </li>
      <li>
        {remindMember.isRemind ?
          [<div key='1' className="option-label"  ><label>会籍到期前</label></div>,
          <div key='2' className="option-label"><InputNumber key='2' min={1} max={100} precision={0} defaultValue={remindMember.days} /> 天</div>] : <div className="option-label">还没有设置任何提醒</div>}
      </li>
    </ul>
  }

  EditBaseInfo() {
    this.setState({
      edit: true
    })
  }
  OnSave() {
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

  onChange(value){
    console.log(value)
  }
  render() {
    const venue = this.state.venue
    return (
      <Layout style={{ height: '100%' }}>
        <Content className="venue-two-panel" style={{ padding: '0 50px', marginTop: 64, minWidth: 1360 }}>
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
                      {this.state.edit ? <Input defaultValue={venue.name} onChange={this.onChange()}/> : <p>{venue.name}</p>}
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
                      {this.state.edit ? <Input defaultValue={venue.phone} /> : <p>{venue.phone}</p>}
                    </div>
                  </li>
                  <li>
                    <div className="option-label">
                      <label >地址</label>
                    </div>
                    <div className="option-input">
                      {this.state.edit ? <Input defaultValue={venue.address} /> : <p>{venue.address}</p>}
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
                <QRCode value={this.state.wechatURL} />
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
