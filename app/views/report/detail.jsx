import './index.css';
import React, { Component } from 'react';
import UIFramework from '@weflex/weflex-ui';
import ProtoTypes from 'prop-types';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Button, DatePicker, Radio, Spin } from 'antd';
import { startOfMonth,endOfMonth,startOfDay, endOfDay, addDays, format, compareDesc } from 'date-fns';
import { reduce, groupBy } from 'lodash';
import { client } from '../../api';
import moment from 'moment';
const { MonthPicker } = DatePicker
export default class ReportDetail extends Component {

  constructor(props) {
    super(props);
    this.cache = {
      accessToken: (JSON.parse(localStorage["weflex.user"])).accessToken,
    };

    this.state = {
      sales: 0,
      salesTrainers: {
        dataName: { key: 'value', name: '销售额' },
        data: [],
      },
      newMembers: 0,
      newMembersSource: {
        dataName: { key: 'value', name: '数量' },
        data: [],
      },
      membersActive: 0,
      newMemberships: 0,
      membershipsEffective: 0,
      bookings: 0,
      classes: 0,
      bookingClasses: {
        type: 'bar',
        dataName: [{
          key: 'confirm',
          name: '完成预约',
          color: '#519FE1',
        }, {
          key: 'cancel',
          name: '取消预约',
          color: '#9CC078',
        }],
        data: [],
      },
      bookingTranier: {
        dataName: [{
          key: 'confirm',
          name: '完成预约',
          color: '#519FE1',
        }, {
          key: 'cancel',
          name: '取消预约',
          color: '#9CC078',
        }],
        data: [],
      },
      isStateReady: false,
      venueId: null,
      venueCreatedAt: new Date('2016-06-01'),
      startsAt: format(addDays(new Date(), -7), 'YYYY-MM-DD'),
      endsAt: format(new Date(), 'YYYY-MM-DD'),
      detailTime: format(addDays(new Date(), -7), 'YYYY-MM')
    };

    this.getReport = this.getReport.bind(this);
    this.onBookingClassesTypeChange = this.onBookingClassesTypeChange.bind(this);
  }

  async componentDidMount() {
    const venue = await client.user.getVenueById();
    const venueId = venue.id;
    const venueCreatedAt = new Date(venue.createdAt);
    this.setState({ venueId, venueCreatedAt });
    this.getReport();
  }

  async getReport() {
    const { sales, salesTrainers, newMembers, newMembersSource, membersActive,
      newMemberships, membershipsEffective, bookings, classes, bookingClasses,
      bookingTranier, startsAt, endsAt, venueId, venueCreatedAt } = this.state;

    if (compareDesc(startsAt, endsAt) < 0) {
      return UIFramework.Message.error('起始时间不小于或等于终止时间');
    }

    this.setState({ isStateReady: true });

    let reportData = await client.venue.report(venueId, {
      startsAt: startOfDay(startsAt),
      endsAt: endOfDay(endsAt),
    });

    this.setState({
      sales: reportData.sales,
      salesTrainers: Object.assign(salesTrainers, { data: reportData.salesTrainers }),
      newMembers: reportData.newMembers,
      newMembersSource: Object.assign(newMembersSource, { data: reportData.sources }),
      membersActive: reportData.membersActive,
      newMemberships: reportData.newMemberships,
      membershipsEffective: reportData.membershipsEffective,
      bookings: reportData.bookings,
      classes: reportData.newClazz,
      bookingTranier: Object.assign(bookingTranier, { data: reportData.bookingTranier }),
      bookingClasses: Object.assign(bookingClasses, { data: reportData.bookingClasses }),
      isStateReady: false,
    });
  }

  onBookingClassesTypeChange(e) {
    const { bookingClasses } = this.state;
    const chartsType = { bar: '柱状图', line: '折线图' }
    bookingClasses.type = e.target.value;
    mixpanel.track(`报表：预定课程情况-${chartsType[bookingClasses.type]}`);
    this.setState({ bookingClasses });
  }

  renderSimpleBar(data) {
    return (
      <BarChart width={800} height={265} data={data.data}
        margin={{ top: 20, right: 50, left: 0, bottom: 10 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Bar dataKey={data.dataName.key} fill="#519FE1" name={data.dataName.name || data.dataName.key} />
      </BarChart>
    );
  }

  renderStackedBar(data) {
    return (
      <BarChart width={800} height={265} data={data.data}
        margin={{ top: 20, right: 50, left: 0, bottom: 10 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        {
          data.dataName.map(item => <Bar key={item.key} dataKey={item.key} stackId="a" fill={item.color} name={item.name || item.key} />)
        }
      </BarChart>
    );
  }

  renderSimpleLine(data) {
    return (
      <LineChart width={800} height={265} data={data.data}
        margin={{ top: 20, right: 50, left: 0, bottom: 10 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        {
          data.dataName.map(item => <Line key={item.key} type="monotone" dataKey={item.key} stroke={item.color} name={item.name || item.key} />)
        }
      </LineChart>
    );
  }

  renderNullData() {
    return (
      <div className="nullData">
        <p className="content">无数据</p>
      </div>
    );
  }

  renderButtonDeatil() {
    let { venueId, detailTime } = this.state;
    const { accessToken } = this.cache;
    detailTime = format(detailTime,'YYYY-MM')
    if (!detailTime) {
      return <Button size="small" disabled>下载明细</Button>;
    } else {
      let fileName = `${detailTime}的运营明细.xlsx`;
      return (
        <a className="ant-btn ant-btn-sm"
          href={`api/venues/${venueId}/classes/export?access_token=${accessToken}&startsAt=${detailTime}&endsAt=${detailTime}`}
          download={fileName} >下载明细</a>
      );
    }
  }

  render() {
    const { sales, salesTrainers, newMembers, newMembersSource, membersActive,
      newMemberships, membershipsEffective, bookings, classes, bookingClasses,
      bookingTranier, startsAt, endsAt, isStateReady, venueCreatedAt ,detailTime} = this.state;
    return (
      <div className="weflex-report">
        <div className="nav">
          <div className="left">
            <DatePicker size='small'
              value={moment(startsAt, 'YYYY-MM-DD')}
              onChange={(dates, dateStrings) => { this.setState({ startsAt: dateStrings || format(venueCreatedAt, 'YYYY-MM-DD'),detailTime:format(dateStrings,'YYYY-MM')}) }}
              disabledDate={current => current && current.valueOf() < startOfDay(venueCreatedAt)}
            />
            <DatePicker size='small'
              value={moment(endsAt, 'YYYY-MM-DD')}
              onChange={(dates, dateStrings) => { this.setState({ endsAt: dateStrings || format(Date.now(), 'YYYY-MM-DD') }) }}
              disabledDate={current => current && current.valueOf() >= Date.now()}
            />
            <Button size='small' onClick={this.getReport} disabled={!(startsAt || endsAt) || isStateReady} >查看</Button>
          </div>
          <div className="right">
            <MonthPicker size='small'
              value={moment(detailTime)} 
              onChange={(dates, dateStrings)=> { 
                this.setState({
                  detailTime: dates
                })}}
              disabledDate={(current) => current && current.valueOf() > endOfMonth(endsAt) | current.valueOf() < startOfMonth(startsAt)}/>
            {this.renderButtonDeatil()}
          </div>
        </div>

        <Spin spinning={isStateReady} size="large" tip="Loading...">
          <div className="content">
            <div className="block">
              <div className="card1">
                <p className="title">销售额</p>
                <p className="total">
                  <span className="finamcial">￥</span>
                  <span className="high-light">{String(sales).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </p>
              </div>
            </div>

            <div className="block">
              <div className="card2">
                <p className="title">教练销售情况</p>
                <div>
                  {
                    salesTrainers.data.length > 0
                      ? this.renderSimpleBar(salesTrainers)
                      : this.renderNullData()
                  }
                </div>
              </div>
            </div>

            <div className="block">
              <div className="card1">
                <p className="title">新增会员数量</p>
                <p className="total" id="newMembers">{newMembers}</p>
              </div>
            </div>

            <div className="block">
              <div className="card2">
                <p className="title">新增会员来源</p>
                <div>
                  {
                    newMembersSource.data.length > 0
                      ? this.renderSimpleBar(newMembersSource)
                      : this.renderNullData()
                  }
                </div>
              </div>
            </div>

            <div className="block">
              <div className="card1">
                <p className="title">活跃会员数量</p>
                <p className="total">{membersActive}</p>
              </div>

              <div className="card1">
                <p className="title">新增会卡数量</p>
                <p className="total">{newMemberships}</p>
              </div>

              <div className="card1 mgr0">
                <p className="title">有效会卡总数</p>
                <p className="total">{membershipsEffective}</p>
              </div>
            </div>

            <div className="block">
              <div className="card1">
                <p className="title">预定总数</p>
                <p className="total">{bookings}</p>
              </div>

              <div className="card1">
                <p className="title">团课排课数量</p>
                <p className="total">{classes}</p>
              </div>
            </div>

            <div className="block">
              <div className="card2 bookingClasses">
                <div className="title">
                  <div className="tl"><span>预定课程情况</span></div>
                  <div className="tr">
                    <Radio.Group size="small" value={bookingClasses.type} onChange={this.onBookingClassesTypeChange}>
                      <Radio.Button value="bar">柱状图</Radio.Button>
                      <Radio.Button value="line">折线图</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>
                <div>
                  {
                    bookingClasses.type == 'bar'
                      ? this.renderStackedBar(bookingClasses)
                      : bookingClasses.type == 'line'
                        ? this.renderSimpleLine(bookingClasses)
                        : this.renderNullData()
                  }
                </div>
              </div>
            </div>

            <div className="block">
              <div className="card2">
                <p className="title">授课预约情况</p>
                <div>
                  {
                    bookingTranier.data.length > 0
                      ? this.renderStackedBar(bookingTranier)
                      : this.renderNullData()
                  }
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}