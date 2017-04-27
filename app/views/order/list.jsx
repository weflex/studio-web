"use strict";

import moment from 'moment';
import React from 'react';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import AddOrderView from './add';
import UIFramework from 'weflex-ui';
import { UIProfileListItem } from '../../components/ui-profile';
import { client } from '../../api';
import './list.css';
import hourminute from 'hourminute';
moment.locale('zh-cn');

function _constructFilter (props) {
  let filter = {};
  const query = props._query;
  for (var param in query) {
    switch (param) {
    case 'classBefore':
    case 'classAfter':
      filter[param] = moment(query[param]);
      break;
    case 'orderStatus':
      filter[param] = query[param];
      break;
    default:
      continue;
    }
  }
  return filter;
}


class List extends React.Component {
  get title() {
    return '订单管理';
  }
  get actions() {
    return [
      {
        title: '创建订单',
        onClick: this.onViewAddOrder.bind(this),
        disableToggled: true,
      }
    ];
  }
  get search() {
    return this.refs
      .masterDetail
      .onSearchInputChange
      .bind(this.refs.masterDetail);
  }
  get config() {
    return {
      title: 'title',
      master: (item, index) => {
        return (
          <UIProfileListItem avatar={item.member.avatar}
            header={item.class.template.name}
            labelText={item.member.nickname}>
            <div className="order-class-duration">
              {moment(item.class.date).format('MM[月]DD[日]')}
            </div>
            <div className="order-num">
              订单号: {item.passcode}
            </div>
          </UIProfileListItem>
        );
      },
      detail: {
        component: Detail
      },
      iterated: true,
      sortKeys: [
        {name: '订单时间', key: 'createdAt'},
        {name: '课程时间', key: 'class.date'},
        {name: '用户', key: 'member.nickname'},
      ],
      onClickAdd: () => {
        this.refs.masterDetail.updateMasterSource();
      },
      addButtonText: '加载更多订单',
    };
  }
  constructor(props) {
    super(props);
    const filter = _constructFilter(props);
    this.state = {
      modalVisibled: false,
      skip: 0,
      data: [],
      filter,
      isMounted: false,
    };
  }
  async componentDidMount() {
    await this.setState({isMounted: true});
    await this.refs.masterDetail.updateMasterSource();
  }
  componentWillReceiveProps(nextProps) {
    const filter = _constructFilter(nextProps);
    this.setState({filter});
    this.refs.masterDetail.updateMasterSource();
  }
  async source() {
    if (!this.state.isMounted) {
      return [];
    }

    const venue = await client.user.getVenueById();
    const {filter, skip} = this.state;
    const limit = 50;
    const whereFilter = {
      venueId: venue.id
    };
    let nextState = {};
    if (filter.orderStatus) {
      switch (filter.orderStatus) {
      case 'cancel':
        whereFilter.cancelledAt = {exists: true};
        break;
      case 'checkin':
        whereFilter.checkedInAt = {exists: true};
        break;
      case 'signup':
        whereFilter.checkedInAt = {exists: false};
        whereFilter.cancelledAt = {exists: false};
        break;
      default:
        break;
      }
    }
    nextState.skip = skip + limit;

    const list = await client.order.list({
      where: whereFilter,
      include: [
        'history',
        {
          'payments': [
            {
              'membership': {
                'member': ['avatar']
              }
            },
            'order'
          ]
        },
        {
          'class': ['template', 'trainer']
        },
        'user'
      ],
      limit,
      skip,
    });

    const ptSessions = await client.ptSession.list({
      where: whereFilter,
      include: [
        'user',
        'member',
        'trainer',
        {
          payment: 'membership',
        },
      ],
      limit,
      skip,
    });

    const orders = (ptSessions || []).map((session) => {
      const startsAt = moment(session.startsAt);
      const endsAt = moment(startsAt).add(session.durationMinutes, 'minutes');
      const trainerName = session.trainer.fullname.first + session.trainer.fullname.last;
      session.class = {
        template: {name: `私教 (${trainerName})`},
        date: moment(startsAt).startOf('day'),
        from: hourminute({hour: startsAt.hour(), minute: startsAt.minute()}),
        to: hourminute({hour: endsAt.hour(), minute: endsAt.minute()}),
        trainer: session.trainer,
      };
      session.title = session.class.template.name;
      session.payments = [session.payment];
      session.isPT = true;
      return session;
    }).concat((list || []).filter((item) => {
      var membership;
      try {
        membership = item.payments[0].membership;
      } catch (error) {
        membership = undefined;
      }
      return item.class && membership && membership.member;
    }).map((item) => {
      item.title = item.class.template.name;
      item.member = item.payments[0].membership.member;
      return item;
    }))
    .sort((a, b) => {
      return a.id > b.id ? -1 : a.id < b.id ? 1 : 0;
    });

    if (orders.length > 0) {
      nextState.data = this.state.data.concat(orders);
    }
    if (Object.keys(nextState).length > 0) {
      this.setState(nextState);
    }
    return nextState.data || this.state.data;
  }
  onViewAddOrder() {
    this.setState({
      modalVisibled: true,
    });
  }
  async onCompleteAddOrder() {
    this.setState({
      modalVisibled: false,
    });
  }
  onRefDetail(instance) {
    if (instance && instance.title) {
      this.props.app.title(instance.title);
    }
  }
  componentWillUnmount() {
  }
  render() {
    return (
      <div style={{height: '100%'}}>
        <MasterDetail 
          ref="masterDetail"
          pathname="order"
          className="order"
          refDetail={this.onRefDetail.bind(this)}
          masterSource={this.source.bind(this)}
          masterConfig={this.config}
        />
        <UIFramework.Modal
          title="添加新订单"
          footer=""
          visible={this.state.modalVisibled}
          onCancel={() => this.setState({modalVisibled: false})}>
          <AddOrderView 
            onComplete={this.onCompleteAddOrder.bind(this)}
          />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = List;
