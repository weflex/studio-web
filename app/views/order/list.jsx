import React from 'react';
import {Table, Pagination, Tabs} from 'antd';
import {client} from '../../api';
import {Link} from 'react-router-component';
import {format} from 'date-fns';
import {getFormatTime} from '../calendar/util.js';
import {filter} from 'lodash';
import './list.css';
const TabPane = Tabs.TabPane;

class List extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orderList           : [],
      ptSessionList       : [],
      orderTotal          : 0,
      ptSessionTotal      : 0,
    };

    this.config = {
      columns   : [{
        title     : '订单号',
        dataIndex : 'bookingNumber',
        key       : 'bookingNumber',
        width     : '8%',
      }, {
        title     : '订单状态',
        dataIndex : 'bookingStatus',
        key       : 'bookingStatus',
        width     : '10%',
      }, {
        title     : '创建时间',
        dataIndex : 'bookingTime',
        key       : 'bookingTime',
        width     : '15%',
      }, {
        title     : '会员名称',
        dataIndex : 'nickName',
        key       : 'nickName',
        width     : '12%',
      }, {
        title     : '课程名称',
        dataIndex : 'className',
        key       : 'className',
        width     : '17%',
      }, {
        title     : '课程时间',
        dataIndex : 'classTime',
        key       : 'classTime',
        width     : '20%',
      }, {
        title     : '课程教练',
        dataIndex : 'trainerName',
        key       : 'trainerName',
        width     : '18%',
      }],
      pageSize : 20,
    };

    this.cache = {
      venueId             : '',
      orderPageNumber     : 1,
      ptSessionPageNumber : 1,
    };

    this.onOrderPageNumberChange = this.onOrderPageNumberChange.bind(this);
    this.onPTSessionPageNumberChange = this.onPTSessionPageNumberChange.bind(this);
    this.updateBooking();
  }

  componentWillReceiveProps(nextProps) {
    this.updateBooking();
  }

  async updateBooking() {
    if(!this.cache.venueId) {
      this.cache.venueId = ( await client.user.getVenueById() ).id;
    };
    this.updateOrderState();
    this.updatePTSessionState();
  }

  async updateOrderState() {
    const {orderPageNumber, venueId} = this.cache;
    const {pageSize} = this.config;

    const orderTotal = ( await client.order.count({where:{venueId}}) ).count;
    const orderList = ( await client.order.list({
      where   : {venueId},
      include : [
        {
          'payments': {'membership': ['package', 'member']}
        },
        {
          'class': ['template', 'trainer']
        },
      ],
      limit   : pageSize,
      skip    : (orderPageNumber - 1) * pageSize,
    }) ).map( (item, i)=>{
      return {
        key            : item.id,
        bookingNumber  : <Link href={'/order?bookingType=order&bookingId='
                           + item.id}>{item.passcode}</Link>,
        bookingTime    : format(item.createdAt, 'YYYY.MM.DD HH:mm:ss'),
        bookingStatus  : this.getStatusLabel(item),
        nickName       : item.payments[0].membership
                           ? item.payments[0].membership.member.nickname : '',
        className      : item.class.template.name,
        classTime      : format(item.class.date, 'YYYY.MM.DD ') + getFormatTime(item.class.from)
                           + ' ~ ' + getFormatTime(item.class.to),
        trainerName    : item.class.trainer.fullname.first + item.class.trainer.fullname.last,
      };
    } );

    this.setState({orderList, orderTotal});
  }

  async updatePTSessionState() {
    const {ptSessionPageNumber, venueId} = this.cache;
    const {pageSize} = this.config;

    const ptSessionTotal = ( await client.ptSession.count({where: {venueId}}) ).count;
    const ptSessionList = ( await client.ptSession.list({
      where   : {venueId},
      include : [
        'member',
        'trainer',
        {
          'payment': {'membership': 'package'}
        },
      ],
      limit   : pageSize,
      skip    : (ptSessionPageNumber - 1) * pageSize,
    }) ).map( (item, i)=>{
      return {
        key            : item.id,
        bookingNumber  : <Link href={'/order?bookingType=ptSession&bookingId='
                           + item.id}>{item.passcode}</Link>,
        bookingTime    : format(item.createdAt,'YYYY.MM.DD HH:mm:ss'),
        bookingStatus  : this.getStatusLabel(item),
        nickName       : item.member.nickname,
        className      : `私教 (${item.trainer.fullname.first + item.trainer.fullname.last})`,
        classTime      : format(item.startsAt, 'YYYY.MM.DD HH:mm')
                           + format(item.endsAt, ' ~ HH:mm'),
        trainerName    : item.trainer.fullname.first + item.trainer.fullname.last,
      };
    } );

    this.setState({ptSessionList, ptSessionTotal});
  }

  getStatusLabel(item) {
    let text = '未签到', color = '#CCC';
    if(item.cancelledAt) {
      text = '已取消';
      color = '#FF8AC2';
    } else if(item.checkedInAt) {
      text = '已签到';
      color = '#6ED4A4';
    };
    return <label className='booking-status'
             style={{backgroundColor:color}}>{text}</label>;
  }

  onOrderPageNumberChange(page, pageSize) {
    this.cache.orderPageNumber = page;
    this.updateOrderState();
  }

  onPTSessionPageNumberChange(page, pageSize) {
    this.cache.ptSessionPageNumber = page;
    this.updatePTSessionState();
  }

  render() {
    const {orderList, orderTotal, ptSessionList, ptSessionTotal} = this.state;
    const {columns, pageSize} = this.config;

    return (
      <div className='wrap-booking-manager'>
        <Tabs defaultActiveKey="1">
          <TabPane tab="团课" key="1">
            <Table columns={columns} dataSource={orderList} pagination={false} />
            <Pagination className='pagination'
              pageSize={pageSize}
              total={orderTotal}
              onChange={this.onOrderPageNumberChange}
            />
          </TabPane>
          <TabPane tab="私教" key="2">
            <Table columns={filter(columns, (item)=>{return item.dataIndex !== 'className'})}
              dataSource={ptSessionList}
              pagination={false}
            />
            <Pagination className='pagination'
              pageSize={pageSize}
              total={ptSessionTotal}
              onChange={this.onPTSessionPageNumberChange}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

module.exports = List;
