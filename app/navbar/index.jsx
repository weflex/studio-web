const React = require('react');
const Link = require('react-router-component').Link;
const gian = require('@weflex/gian');
const client = require('@weflex/gian').getClient('dev');

require('./index.css');
require('../layout/font.css');

class NavItem extends React.Component {
  render () {
    return (
      <li>
        <Link href={this.props.location}>
          <span className={'icon-font icon-' + this.props.icon}></span>
          <span className='ref-text'>{this.props.hint}</span>
        </Link>
      </li>
    );
  }
}

class DataItem extends React.Component {
  render () {
    const bgColors = {
      signup:  '#ff8560',
      cancel:  '#a489d6',
      checkin: '#6bdfc2'
    };
    var backgroundColor = bgColors[this.props.type];
    return (
      <div className='data-item' style={{backgroundColor}}>
        <div className='value'>
          {this.props.value}
        </div>
        <div className='hint'>
          {this.props.hint}
        </div>
      </div>
    );
  }
}

class NavBar extends React.Component {
  constructor () {
    super();
    this.state = {
      user: {
        nickname: '未登陆'
      }
    };
  }
  async componentDidMount () {
    var user = await client.user.getCurrent();
    this.setState({user});
  }
  render () {
    return (
      <ul className='navbar'>
        <li>
          <div className='studio-name'>WeFlex</div>
          <div className='username'>
            {this.state.user.nickname} | <a href='/login'>登出</a>
          </div>
          <DataItem value='8'  hint='课程登记' type='signup' />
          <DataItem value='5'  hint='课程取消' type='cancel' />
          <DataItem value='10' hint='课程签到' type='checkin' />
        </li>
        <NavItem location='/calendar'        hint='课程日历'  icon='calendar' />
        <NavItem location='/class/template'  hint='课程模板'  icon='star' />
        <NavItem location='/class/package'   hint='卡种管理'  icon='heart' />
        <NavItem location='/trainer'         hint='教练管理'  icon='database' />
        <NavItem location='/membership'      hint='会员管理'  icon='user' />
        <NavItem location='/order'           hint='订单管理'  icon='inbox' />
        <NavItem location='/analytics'       hint='数据分析'  icon='light-bulb' />
      </ul>
    );
  }
}

module.exports = NavBar;
