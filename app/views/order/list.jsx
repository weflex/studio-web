import React from 'react';
import {Table, Pagination, Menu, Button} from 'antd';
import {client} from '../../api';
import {Link} from 'react-router-component';
import {format} from 'date-fns';
import {getFormatTime} from '../calendar/util.js';
import {filter} from 'lodash';
import {find} from 'lodash';
import UIFramework from 'weflex-ui';
import AddBookingView from './add';
import './list.css';

class List extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bookingList    : [],
      bookingTotal   : 0,
      showAddBooking : false,
      pageNumber     : 1,
    };

    this.config = {
      orderColumns     : [{
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
    this.config.ptSessionColumns = filter(this.config.orderColumns,
      (item)=>{return item.dataIndex !== 'className'});

    this.cache = {
      venueId    : '',
      pageNumber : 1,
    };

    this.onPageNumberChange = this.onPageNumberChange.bind(this);
    this.bookSuccess = this.bookSuccess.bind(this);
    this.showViewAddBooking = this.showViewAddBooking.bind(this);
    this.updateBooking();
  }

  componentWillReceiveProps(nextProps) {
    this.cache.pageNumber = 1;
    this.updateBooking(nextProps.bookingType);
  }

  async updateBooking(bookingType) {
    bookingType = bookingType || this.props.bookingType  || 'order';

    if(!this.cache.venueId) {
      this.cache.venueId = ( await client.user.getVenueById() ).id;
    };
    bookingType === 'order'
      ? this.updateOrderState()
      : this.updatePTSessionState();
  }

  async updateOrderState() {
    const {pageNumber, venueId} = this.cache;
    const {pageSize} = this.config;

    const orderTotal = ( await client.order.count({where:{venueId}}) ).count;
    const orderList = ( await client.order.list({
      where   : {venueId},
      include : [
        {
          'class': ['template', 'trainer']
        },
        {
          'user': {'members': 'avatar'},
        },
      ],
      limit   : pageSize,
      skip    : (pageNumber - 1) * pageSize,
    }) ).map( (item, i)=>{
      const nickName = ( find(item.user.members, (member) => {
        return item.venueId === member.venueId && !member.trashedAt;
      }) || find(item.user.members, (member) => {
        return item.venueId === member.venueId;
      }) ).nickname;
      return {
        key            : item.id,
        bookingNumber  : <Link href={'/order/order/' + item.id}>{item.passcode}</Link>,
        bookingTime    : format(item.createdAt, 'YYYY.MM.DD HH:mm:ss'),
        bookingStatus  : this.getStatusLabel(item),
        nickName,
        className      : item.class.template.name,
        classTime      : format(item.class.date, 'YYYY.MM.DD ') + getFormatTime(item.class.from)
                           + ' ~ ' + getFormatTime(item.class.to),
        trainerName    : item.class.trainer.fullname.first + item.class.trainer.fullname.last,
      };
    } );

    this.setState({bookingList: orderList, bookingTotal: orderTotal, pageNumber});
  }

  async updatePTSessionState() {
    const {pageNumber, venueId} = this.cache;
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
      skip    : (pageNumber - 1) * pageSize,
    }) ).map( (item, i)=>{
      return {
        key            : item.id,
        bookingNumber  : <Link href={'/order/ptSession/' + item.id}>{item.passcode}</Link>,
        bookingTime    : format(item.createdAt,'YYYY.MM.DD HH:mm:ss'),
        bookingStatus  : this.getStatusLabel(item),
        nickName       : item.member.nickname,
        className      : `私教 (${item.trainer.fullname.first + item.trainer.fullname.last})`,
        classTime      : format(item.startsAt, 'YYYY.MM.DD HH:mm')
                           + format(item.endsAt, ' ~ HH:mm'),
        trainerName    : item.trainer.fullname.first + item.trainer.fullname.last,
      };
    } );

    this.setState({bookingList: ptSessionList, bookingTotal: ptSessionTotal, pageNumber});
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

  onPageNumberChange(page, pageSize) {
    this.cache.pageNumber = page;
    this.updateBooking();
  }

  showViewAddBooking() {
    this.setState({showAddBooking: true});
  }

  bookSuccess() {
    this.cache.pageNumber = 1;
    this.setState({showAddBooking: false})
    this.updateBooking();
  }

  render() {
    const {bookingList, bookingTotal, showAddBooking, pageNumber} = this.state;
    const {orderColumns, ptSessionColumns, pageSize} = this.config;
    const {bookingType} = this.props;

    return (
      <div className='wrap-booking-manager'>
        <div className='wrap-button-booking'>
          <Button onClick={this.showViewAddBooking}>创建订单</Button>
        </div>

        <Menu className='booking-menu' selectedKeys={[bookingType]} mode="horizontal">
          <Menu.Item key="order">
            <Link href={'/order/order'}>团课</Link>
          </Menu.Item>
          <Menu.Item key="ptSession">
            <Link href={'/order/ptSession'}>私教</Link>
          </Menu.Item>
        </Menu>

        <Table
          columns={bookingType ==='order' ? orderColumns : ptSessionColumns}
          dataSource={bookingList}
          pagination={false}
        />
        <Pagination
          className='pagination'
          current={pageNumber}
          pageSize={pageSize}
          total={bookingTotal}
          onChange={this.onPageNumberChange}
        />

        <UIFramework.Modal
          title="添加新订单"
          footer=""
          visible={showAddBooking}
          onCancel={ () => {this.setState({showAddBooking: false});} }>
          <AddBookingView onComplete={this.bookSuccess}/>
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = List;
