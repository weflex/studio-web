import './list.css';
import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';
import { Link } from 'react-router-component';
import { Table,Spin, Pagination, Menu, Input, Button } from 'antd';
import { format, compareAsc } from 'date-fns';
import { filter } from 'lodash';

class List extends React.Component {

  static propType = {
    bookingType: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      isStateReady:true,
      bookingList: [],
      bookingTotal: 0,
      pageNumber: 1,
      bookingType: props.bookingType,
      search: null,
    };

    this.config = {
      orderColumns: [{
        title     : '订单状态',
        dataIndex : 'bookingStatus',
        key       : 'bookingStatus',
        width     : '10%',
      }, {
        title     : '会员姓名',
        dataIndex : 'nickName',
        key       : 'nickName',
        width     : '10%',
      }, {
        title     : '课程名称',
        dataIndex : 'courseName',
        key       : 'courseName',
        width     : '17%',
      }, {
        title     : '课程教练',
        dataIndex : 'trainerName',
        key       : 'trainerName',
        width     : '15%',
      }, {
        title     : '课程开始时间',
        dataIndex : 'classTime',
        key       : 'classTime',
        width     : '15%',
      }, {
        title     : '下单时间',
        dataIndex : 'bookingTime',
        key       : 'bookingTime',
        width     : '15%',
      }, {
        title     : '订单号',
        dataIndex : 'bookingNumber',
        key       : 'bookingNumber',
        width     : '8%',
      }, {
        title     : '操作',
        dataIndex : 'operation',
        key       : 'operation',
        width     : '10%',
      }, ],
      pageSize: 20,
    };
    this.config.ptSessionColumns = filter(this.config.orderColumns, (item)=>{return item.dataIndex !== 'courseName'});

    this.cache = {
      venueId: '',
      searchFilter: {},
      timer: undefined,
    };

    this.onPageNumberChange = this.onPageNumberChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount() {
    this.updateBooking();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({pageNumber: 1, bookingType: nextProps.bookingType}, this.updateBooking);
  }

  async updateBooking() {
    let { bookingType, search } = this.state;
    let { venueId } = this.cache;

    if(!this.cache.venueId) {
      this.cache.venueId = venueId = ( await client.user.getVenueById() ).id;
    };

    const whereFilter = {
      venueId,
      trashedAt: { exists: false },
    };

    if(search) {
      const membersId = ( await client.member.list({
        where: {
          venueId,
          or:[
            { nickname: {like: search} },
            { phone: {like: search} },
          ]
        }
      }) ).map( item => item.id );

      whereFilter.or = [
        { memberId: {inq: membersId} },
        { passcode: {like: search} },
      ]
    }


    bookingType === 'order'? await this.getOrderList(whereFilter): await this.getPTSessionList(whereFilter);
  }

  async getOrderList(whereFilter) {
    const { pageSize } = this.config;
    const { pageNumber } = this.state;
    const where = whereFilter;

    const orderTotal = ( await client.order.count({ where })).count;
    const orderList = ( await client.order.list({
      where,
      include: [
        {
          'class': ['template', 'trainer'],
        },
        {
          'member': 'avatar',
        },
      ],
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize,
      order: 'createdAt DESC',
    }) ).map( (item, i)=>{
      return {
        key            : item.id,
        bookingNumber  : <Link href={'/booking/order/' + item.id}>{item.passcode}</Link>,
        bookingTime    : format(item.createdAt, 'YYYY.MM.DD HH:mm'),
        bookingStatus  : this.getStatusLabel(item, item.class.startsAt),
        nickName       : item.member && item.member.nickname || '',
        courseName     : item.class.template.name,
        classTime      : format(item.class.startsAt, 'YYYY.MM.DD HH:mm'),
        trainerName    : item.class.trainer? item.class.trainer.fullname.first + item.class.trainer.fullname.last: '',
        operation      : item.cancelledAt? '': <Button type="danger" size="small" onClick={e => this.onCancel(item.id)}>取消</Button>,
      };
    });

    this.setState({bookingList: orderList, bookingTotal: orderTotal, pageNumber,isStateReady:false});
  }

  async getPTSessionList(whereFilter) {
    const { pageSize } = this.config;
    const { pageNumber } = this.state;
    const where = whereFilter;

    const ptSessionTotal = ( await client.ptSession.count({where})).count;
    const ptSessionList = ( await client.ptSession.list({
      where,
      include: [
        'member',
        'trainer',
      ],
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize,
      order: 'createdAt DESC',
    }) ).map( (item, i)=>{
      const trainerName = item.trainer? item.trainer.fullname.first + item.trainer.fullname.last: '';
      return {
        key            : item.id,
        bookingNumber  : <Link href={'/booking/ptSession/' + item.id}>{item.passcode}</Link>,
        bookingTime    : format(item.createdAt,'YYYY.MM.DD HH:mm'),
        bookingStatus  : this.getStatusLabel(item, item.startsAt),
        nickName       : item.member && item.member.nickname || '',
        courseName     : `私教 (${trainerName})`,
        classTime      : format(item.startsAt, 'YYYY.MM.DD HH:mm'),
        trainerName,
        operation      : item.cancelledAt? '': <Button type="danger" size="small" onClick={e => this.onCancel(item.id)}>取消</Button>,
      };
    });

    this.setState({bookingList: ptSessionList, bookingTotal: ptSessionTotal, pageNumber,isStateReady:false});
  }

  getStatusLabel(item, startsAt) {
    let text = '已预约', color = '#CCC';
    if(item.cancelledAt) {
      text = '已取消';
      color = '#FF8AC2';
    } else if( compareAsc( startsAt, new Date() ) < 0) {
      text = '已完成';
      color = '#6ED4A4';
    };
    return <label className='booking-status' style={{backgroundColor:color}}>{text}</label>;
  }

  onPageNumberChange(page, pageSize) {
    this.setState({pageNumber: page}, this.updateBooking);
  }

  async onSearch(value) {
    const { venueId } = this.cache;
    this.setState({
      pageNumber: 1,
      search: value.replace(/^\s+|\s+$/g, ''),
    }, this.updateBooking);
  }

  async onChange(e){
    let { timer } = this.cache;
    const value = e.target.value;
    if(timer) {
      clearTimeout(timer);
    }
    this.cache.timer = setTimeout( ()=>{this.onSearch(value)}, 500 );
  }

  async onCancel(bookingId) {
    const{bookingType} = this.state;

    UIFramework.Modal.confirm({
      title: '确认取消该订单?',
      content: '确认取消该订单?',
      onOk: async () => {
        try {
          if(bookingType === 'order')  await client.order.cancelById(bookingId)
          else if(bookingType === 'ptSession') await client.ptSession.cancelById(bookingId);
          this.updateBooking();
        } catch (error) {
          UIFramework.Message.error('取消失败');
        }
      }
    });
  }

  render() {
    const { bookingList, bookingTotal, pageNumber, bookingType, search,isStateReady } = this.state;
    const { orderColumns, ptSessionColumns, pageSize } = this.config;

    return (
      <Spin spinning={isStateReady} size="large" tip="Loading...">
      <div className='wrap-booking-manager'>

        <Menu className='booking-menu' selectedKeys={[bookingType]} mode="horizontal">
          <Menu.Item key="order">
            <Link href={'/booking/order'}>团课</Link>
          </Menu.Item>
          <Menu.Item key="ptSession">
            <Link href={'/booking/ptSession'}>私教</Link>
          </Menu.Item>
        </Menu>

        <Input.Search
          placeholder="订单号/会员姓名/手机号"
          style={{ width: 200, marginBottom: 10 }}
          onChange={ this.onChange.bind(this) }
          onSearch={ this.onSearch }
        />

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
      </div>
      </Spin>
    );
  }
}

export default List;
