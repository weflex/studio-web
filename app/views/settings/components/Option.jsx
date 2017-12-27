import React from 'react';
import { InputNumber, Checkbox, Button } from 'antd';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../../api';
class Header extends React.Component {
  constructor(props) {
    super(props)
  }

  viewModel() {
    if (typeof this.props.config.showSet == 'function') {
      this.props.config.showSet()
    }
  }
  static props = {
    data: React.PropTypes.object,
  }

  render() {
    const { settingName, content, isEdit } = this.props.config
    return (
      <div className="param-hd">
        <h3>{content}</h3>
        {isEdit ? '' : <a href="javascript:;" className="wf-link-btn" onClick={this.viewModel.bind(this)}>{settingName}</a>}
      </div>
    )
  }
}

class Foot extends React.Component {
  constructor(props) {
    super(props)
  }

  onSave() {
    if (typeof this.props.data.onSave == 'function') {
      this.props.data.onSave()
    }
  }

  onCancel() {
    if (typeof this.props.data.onCancel == 'function') {
      this.props.data.onCancel()
    }
  }

  render() {
    return (
      <div>
        <div className="option-split"></div>
        <Button type="primary" onClick={this.onSave.bind(this)} >确定</Button> <Button onClick={this.onCancel.bind(this)}>取消</Button>
      </div>
    )
  }
}
class Option extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isSet: false,
      venue: this.props.venue,
      config: {
        settingName: '设置',
        content: '会籍到期提醒',
        isEdit: false,
        showSet: this.showSet.bind(this)
      },
      saveAndCancel: {
        onSave: this.onSave.bind(this),
        onCancel: this.onCancel.bind(this)
      },
      form: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      venue: nextProps.venue
    });
  }

  showSet() {
    let config = this.state.config
    config.isEdit = true
    this.setState({
      isSet: true,
      config,
    })
  }

  isUndefined(o) {
    if (typeof o == 'undefined' || o == 'undefined') {
      return true
    } else if (typeof o == 'object') {
      let arr = Object.keys(o)
      for (let i = 0; i < arr.length; i++) {
        if (this.isUndefined(o[arr[i]])) {
          return true
        }
      }
    }
    return false
  }

  async onSave() {
    let { venue, form } = this.state
    if (this.isUndefined(form)) {
      return UIFramework.Message.error('请填写完整');
    }
    const newVenue = Object.assign(venue, form)
    try {
      await client.venue.upsert(newVenue);
    } catch (err) {
      console.log(err)
    }
    let config = this.state.config
    config.isEdit = false
    this.setState({
      isSet: false,
      config,
      venue: newVenue
    })
  }
  onCancel() {
    let config = this.state.config
    config.isEdit = false
    this.setState({
      isSet: false,
      config,
      form: {}
    })
  }
  setRemindMember(e) {
    let form = this.state.form
    if (typeof e == 'number' || typeof e == 'undefined') {
      const newForm = Object.assign(form, { remindMember: { isRemind: this.state.venue.remindMember.isRemind, days: e } })
    } else if (typeof e == 'object') {
      const newForm = Object.assign(form, { remindMember: { isRemind: e.target.checked, days: this.state.venue.remindMember.days } })
    } else if (typeof e == 'undefined') {
      console.log(this)
    }
  }
  setTips() {
    const { isSet } = this.state
    const venue = this.state.venue
    let result = []
    if (!isSet) {
      result.push(<p key='1' className="wf-set-tips">当前场馆设置，最晚预约开课前 <span className="wf-tips-color">{venue.deadline}</span> 小时内不能取消订单</p>)
      if (venue.remindMember && venue.remindMember.isRemind) {
        result.push(<p key='2' className="wf-set-tips">  当前场馆设置，会员会卡过期前 <span className="wf-tips-color">{venue.remindMember.days}</span> 天提醒</p>)
      }
    } else {
      result.push(<p key='3' className="wf-set-tips">勾选你要选用的提醒条件，并输入对应数值</p>)
      result.push(
        <ul key='4' className="wf-set-tips">
          <li >
            <Checkbox defaultChecked={true} />
            当前场馆设置
            <span style={{ color: "#ff9d00" }}>最晚预约开课前</span>
            <InputNumber min={0} defaultValue={venue.deadline} style={{ margin: "0 5px 0 5px" }} onChange={
              (value) => {
                let form = this.state.form
                form.deadline = value
                this.setState({
                  form
                })
              }
            } />
            小时内不能取消订单
          </li>
          <li >
            <Checkbox defaultChecked={venue.remindMember.isRemind} onChange={this.setRemindMember.bind(this)} />
            当前场馆设置
            <span style={{ color: "#ff9d00" }}>会员会卡过期前</span>
            <InputNumber min={0} defaultValue={venue.remindMember.days} style={{ margin: "0 5px 0 5px" }} onChange={this.setRemindMember.bind(this)} />
            天提醒
          </li>
        </ul>,
        <Foot key='5' data={this.state.saveAndCancel} />
      )
    }
    return result
  }

  render() {
    return (
      <div className="wf-panel" style={{ marginTop: 20 }}>
        <Header config={this.state.config}></Header>
        <div className="param-bd">
          {this.setTips()}
        </div>
      </div>
    )
  }
}

module.exports = {
  Header,
  Foot,
  Option
}