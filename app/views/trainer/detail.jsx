import './index.css';
import React from 'react';
import {range} from 'lodash';
import {client} from '../../api';
import UIFramework from '@weflex/weflex-ui';
import {Radio,Row, Col, Button, Input, Select, Table, DatePicker, Pagination} from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
import TrainerProfile from './profile';
import TrainerSchedule from './schedule';
import {startOfDay, endOfDay, format} from 'date-fns';

class PTSchedule extends React.Component {
  static propTypes = {
    dataSource: React.PropTypes.object,
    trainerId: React.PropTypes.string,
    venueId: React.PropTypes.string,
    // onCancel: ,
    // on
  };

  constructor (props) {
    super(props);

    this.state = {
      classPackages: [],
      schedule: props.dataSource,
      scheduleIndex: 1,
      showPTSchedule: false,
      disabled: true,
      style: {
        marginBottom: '10px',
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      schedule: nextProps.dataSource,
      venueId: nextProps.venueId,
    });
  }

  async componentDidMount () {
    const venue = await client.user.getVenueById();
    const wildcard = [{id: '*', name: '所有会卡'}];
    const classPackages = await client.classPackage.list({
      where: {
        venueId: venue.id,
      }
    });
    this.setState({
      classPackages: wildcard.concat(classPackages),
    });
  }

  onCancel() {
    const { dataSource } = this.props;
    UIFramework.Modal.confirm({
      title: '确认取消私教排期?',
      content: '取消私教排期后，将不能创建该教练的私教课程',
      onOk: async () => {
        await client.ptSchedule.delete(dataSource.id, dataSource.modifiedAt);
        this.setState({'schedule': null});
      },
    });
  }

  renderSchedule() {
    const weekName = ['日', '一', '二', '三', '四', '五', '六'];
    const { scheduleIndex, schedule } = this.state;

    return [1, 2, 3, 4, 5, 6, 0].map(i => {
      let className = 'schedule-day-item';
      if( schedule.datetime[i].length > 0 ){
        className += ' schedule-day-item-border';
      }
      if( scheduleIndex === i ){
        className += ' schedule-day-item-background';
      }
      return (<Button key={i} className={className} onClick={()=>{this.setState({scheduleIndex: i})}}>
        周{weekName[i]}
      </Button>);
    });
  }

  render () {
    const { schedule, scheduleIndex, classPackages, showPTSchedule ,style} = this.state;
    return (
      <Row className='schedule'>
        <div className='card-header'>
          <h3>私教排期</h3>
          <ul className='actions'>
            {
              schedule
                ? <li><Button size='small' onClick={this.onCancel.bind(this)}>取消</Button></li>
                : ""
            }
            <li>
              <Button size='small' onClick={() => {mixpanel.track( "教练详情：私教排期" );this.setState({showPTSchedule: true})}}>
                编辑
              </Button>
            </li>
          </ul>
        </div>
        {
          schedule
          ?<div>
            <div className='detail-card-row'>
              <label>排课时间</label>
              <span>{this.renderSchedule()}</span>
            </div>
            <div className='detail-card-row'>
              {
                range(6, 23).map((item, key) => {
                  let className = 'hour';
                  if (schedule.datetime[scheduleIndex].indexOf(item) > -1) {
                    className += ' active';
                  }
                  return <span key={key} className={className}>{(item > 9)? item: '0' + item}:00</span>
                })
              }
            </div>
            <div className='detail-card-row'>
              <label>课程时长</label>
              <span>{ schedule.durationMinutes + ' 分钟' }</span>
            </div>
            <RadioGroup onChange={this.onChange} value={schedule.orderMode} style={style}>
                <Radio disabled={this.state.disabled} value={"整点预约"}>整点预约</Radio>
                <Radio disabled={this.state.disabled} value={"半小时预约"}>半小时预约</Radio>
            </RadioGroup>
            <div className='detail-card-row'>
              <label>关联会卡</label>
              <Select multiple
                      disabled
                      value={schedule.paymentOptionIds}
                      style={{width: 'calc(100% - 90px)'}}>
                {
                  classPackages.map((membership, key) =>
                    <Option value={membership.id} key={key}>{membership.name}</Option>
                  )
                }
              </Select>
            </div>
          </div>
          :<span className='placeholder'>该教练暂时没有私教排期</span>
        }

        <UIFramework.Modal
          ref="ptScheduleModal"
          footer=""
          title='私教排期'
          onCancel={() => { this.setState({showPTSchedule: false})} }
          visible={showPTSchedule}>
          <TrainerSchedule
            schedule={schedule}
            trainerId={this.props.trainerId}
            onComplete={(ptSchedule) => {
              this.setState({
                showPTSchedule: false,
                schedule: Object.assign({}, ptSchedule),
              });
            }}/>
        </UIFramework.Modal>
      </Row>
    );
  }
}

class TrainerSalesList extends React.Component {
  static propTypes = {
    trainerId: React.PropTypes.string,
    trainerName: React.PropTypes.string,
  };

  constructor (props) {
    super(props);
    const { trainerId, trainerName } = props;

    this.state = {
      salesList  : [],
      salesTotal : 0,
      pageNumber : 1,
    }

    this.cache = {
      pageSize  : 7,
      pageNumber: 1,
      startDate : "",
      endDate   : "",
      columns   : [{
        title     : '销售日期',
        dataIndex : 'createDate',
        key       : 'createDate',
        width     : '25%'
      }, {
        title     : '会卡名称',
        dataIndex : 'packageName',
        key       : 'packageName',
        width     : '25%'
      }, {
        title     : '金额',
        dataIndex : 'price',
        key       : 'price',
        width     : '20%'
      }, {
        title     : '购买人',
        dataIndex : 'memberName',
        key       : 'memberName',
        width     : '30%'
      }],
      accessToken : ( JSON.parse(localStorage["weflex.user"]) ).accessToken,
    }

    this.updateSalesList(props.trainerId);

    this.onDateChange = this.onDateChange.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.trainerId !== this.props.trainerId) {
      this.cache.pageNumber = 1;
      this.updateSalesList(nextProps.trainerId);
    };
  }

  async updateSalesList (trainerId) {
    const {startDate, endDate, pageSize, pageNumber} = this.cache;
    if (!trainerId) {
      this.setState({salesList: []});
      return;
    };

    let queryTerms = {
      where: {
        salesId: trainerId,
      },
      include:['member', 'package'],
      limit: pageSize,
      skip: (pageNumber - 1) * pageSize,
    };
    if (startDate && endDate) {
      queryTerms.where['createdAt'] = {between: [startOfDay(startDate), endOfDay(endDate)]};
    };

    const salesTotal = ( await client.membership.count(queryTerms) ).count;
    const salesList = ( await client.membership.list(queryTerms) ).map((item, i) => {
      return {
        key         : item.id,
        createDate  : format(item.createdAt, "YYYY-MM-DD HH:mm"),
        packageName : !item.package ? "" :item.package.name,
        price       : item.price,
        memberName  : !item.member ? "" : item.member.nickname,
        salesName   : this.props.trainerName,
      };
    });

    salesTotal > 0
      ? this.setState({salesList, salesTotal, pageNumber})
      : this.setState({salesList: [], salesTotal: 0, pageNumber: 1});
  }

  renderButtonExport () {
    const {trainerId, trainerName} = this.props;
    const {salesTotal} = this.state;
    const {accessToken, startDate, endDate} = this.cache;
    let startsAt = "", endsAt = "";
    let fileName = trainerName + "的销售记录" + format(new Date(),"YYYY.MM.DD") + ".xlsx";

    if (startDate) {
      startsAt = "&startsAt=" + startDate;
      endsAt = "&endsAt=" + endDate;
    } else {
      startsAt = "&startsAt=2010-01-01";
    };

    const buttonExport = salesTotal > 0
      ? <a className="ant-btn ant-btn-sm"
        href={ "/api/collaborators/" + trainerId + "/sales/export?access_token=" + accessToken + startsAt + endsAt }
        download={fileName} >导 出</a>
      : <Button size="small" disabled>导 出</Button>;

    return buttonExport;
  }

  onDateChange (date, dateString) {
    this.cache.startDate = dateString[0]? dateString[0] : "";
    this.cache.endDate = dateString[1]? dateString[1] : "";
    this.cache.pageNumber = 1;
    this.updateSalesList(this.props.trainerId);
  }

  onPageChange (page, pageSize) {
    this.cache.pageNumber = page;
    this.updateSalesList(this.props.trainerId);
  }

  render () {
    const {salesList, salesTotal, pageNumber} = this.state;
    const {columns, pageSize} = this.cache;

    return (
      <Row>
        <div className='card-header'>
          <h3>销售记录</h3>
          <ul className='actions'>
            <li>
              <RangePicker size='small' onChange={this.onDateChange} />
            </li>
            <li>
              {this.renderButtonExport()}
            </li>
          </ul>
        </div>
        {
          salesTotal === 0
            ? <div>没有找到销售记录</div>
            : <div className='trainerSalesList'>
                <div>一共找到<b className="red">{salesTotal}</b>条销售记录</div>
                <Table columns={columns} dataSource={salesList} pagination={false}/>
                <Pagination
                  style={{marginTop:'20px', float:'right'}}
                  current={pageNumber}
                  total={salesTotal}
                  pageSize={pageSize}
                  onChange={this.onPageChange}
                />
              </div>
        }
      </Row>
    )
  }
}

module.exports = class TrainerDetail extends React.Component {
  static propTypes = {
    trainerId: React.PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      dataSource: {
        avatar: {},
      },
    };
  }

  async componentDidMount () {
    const defaultAvatar = {uri: 'http://static.theweflex.com/default-avatar-male.png'};
    const trainer = await client.collaborator.get(
      this.props.trainerId,
      {
        include: [
          {
            'user': ['avatar'],
          },
          {
            relation: 'ptSchedule',
            scope: {
              where: {
                trashedAt: {
                  exists: false,
                },
              },
            },
            include: ['paymentOptions'],
          },
        ],
      }
    );
    
    const dataSource = {
      id: trainer.id,
      avatar: trainer.user.avatar || defaultAvatar,
      name: trainer.fullname.first + trainer.fullname.last,
      description: trainer.description || '暂无教练简介',
      phone: trainer.user.phone,
      sex: trainer.sex === 'male' ? '男' : '女',
      employmentStatus: trainer.employmentStatus,
      ptSchedule: trainer.ptSchedule,
      venueId: trainer.venueId,
      orgId: trainer.orgId,
      modifiedAt: trainer.modifiedAt,
      roles:trainer.roleIds
    };

    if (dataSource.ptSchedule && dataSource.ptSchedule.paymentOptionIds.indexOf('*') > -1) {
      dataSource.ptSchedule.paymentOptions = [
        {
          name: '所有会卡',
          id: '*',
        }
      ];
    }

    this.setState({ dataSource });
  }

  dismissModal (refName) {
    this.setState({[refName + 'Visible']: false});
  }

  triggerModal (refName) {
    this.setState({[refName + 'Visible']: true});
    mixpanel.track( "教练详情：编辑教练信息" );
  }

  render () {
    const { dataSource } = this.state;
    const ptSchedule = dataSource.ptSchedule;
    return (
      <div className='trainer-detail'>
        <Row className='summary'>
          <div className='card-header'>
            <h3>基本信息</h3>
            <ul className='actions'>
              <li>
                <Button
                  size='small'
                  onClick={() => {
                    UIFramework.Modal.confirm({
                      title: '确认删除教练？',
                      content: dataSource.roles.indexOf("$owner") > -1? '该教练为场馆主教练，无法被删除': '删除后，请及时修改该教练的课程',
                      onOk: async () => {
                        if (dataSource.roles.indexOf("$owner") == -1) {
                          await client.collaborator.delete(dataSource.id, dataSource.modifiedAt);
                          location.href = '/trainer/';
                        }
                      }
                    });
                  }}>
                  删除教练
                </Button>
              </li>
              <li>
                <Button size='small'
                        onClick={this.triggerModal.bind(this, 'profileModal')}>
                  编辑
                </Button>
              </li>
            </ul>
          </div>
          <Col span={12}>
            <img src={dataSource.avatar.uri} className='avatar' />
          </Col>
          <Col span={12}>
            <div className='detail-card-row'>
              <label>教练姓名</label>
              {dataSource.name}
            </div>
            <div className='detail-card-row'>
              <label>联系方式</label>
              {dataSource.phone}
            </div>
            <div className='detail-card-row'>
              <label>教练类型</label>
              {dataSource.employmentStatus}
            </div>
            <div className='detail-card-row'>
              <label>教练简介</label>
              {dataSource.description}
            </div>
          </Col>
        </Row>

        <PTSchedule dataSource={ptSchedule} trainerId={dataSource.id} venueId={dataSource.venueId}/>

        <TrainerSalesList trainerId={dataSource.id} trainerName={dataSource.name}/>

        <UIFramework.Modal
          ref="profileModal"
          footer=""
          title='基本信息'
          onCancel={() => this.setState({profileModalVisible: false})}
          visible={this.state.profileModalVisible}>
          <TrainerProfile
            trainer={this.state.dataSource}
            onComplete={(trainer) => {
              const newTrainer = Object.assign({}, dataSource, trainer);
              this.setState({
                profileModalVisible: false,
                dataSource: newTrainer,
              });
            }}/>
        </UIFramework.Modal>
      </div>
    );
  }
};
