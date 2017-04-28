import React from 'react';
import hourminute from 'hourminute';
import {range} from 'lodash';
import moment from 'moment';
import {client} from '../../api';
import UIFramework from 'weflex-ui';
import {Row, Col, Button, Input, Select, Table, DatePicker, Pagination} from 'antd';
const Option = Select.Option;
const { RangePicker } = DatePicker;
import TrainerProfile from './profile';
import TrainerSchedule from './schedule';
import {startOfDay, endOfDay, format} from 'date-fns';

class PTSchedule extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      classPackages: [],
    };
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

  render () {
    const ptSchedule = this.props.dataSource;
    const classPackages = this.state.classPackages;
    if (ptSchedule) {
      return (
        <div>
          <div className='detail-card-row'>
            <label>排课时间</label>
            <span>
              {
                range(1, 8).map((day, key) => {
                  const dayString = moment().isoWeekday(day).format('ddd');
                  let className = 'day';
                  if (ptSchedule.days.indexOf(day) > -1) {
                    className += ' active';
                  }
                  return <span className={className} key={key}>{dayString}</span>
                })
              }
            </span>
          </div>
          <div className='detail-card-row'>
            <label></label>
            <span>
              {
                range(6, 23).map((hour, key) => {
                  const hourString = hourminute({hour}).format();
                  let className = 'hour';
                  if (ptSchedule.hours.indexOf(hour) > -1) {
                    className += ' active';
                  }
                  return <span className={className} key={key}>{hourString}</span>
                })
              }
            </span>
          </div>
          <div className='detail-card-row'>
            <label>课程时长</label>
            <span>
              {
                ptSchedule.durationMinutes + ' 分钟'
              }
            </span>
          </div>
          <div className='detail-card-row'>
            <label>关联会卡</label>
            <Select multiple
                    disabled
                    value={ptSchedule.paymentOptionIds}
                    style={{width: 'calc(100% - 90px)'}}>
              {
                classPackages.map((membership, key) =>
                  <Option value={membership.id} key={key}>{membership.name}</Option>
                )
              }
            </Select>
          </div>
        </div>
      );
    } else {
      return <span className='placeholder'>该教练暂时没有私教排期</span>;
    }
  }
}

class TrainerSalesList extends React.Component {
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
  constructor (props) {
    super(props);
    this.state = {
      dataSource: props.dataSource || {
        avatar: {},
      },
    };
  }

  // component lifecycle methods

  async componentDidMount () {
    const defaultAvatar = {uri: 'http://static.theweflex.com/default-avatar-male.png'};
    const trainer = await client.collaborator.get(
      this.props.id,
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
    };

    if (trainer.ptSchedule &&
        trainer.ptSchedule.paymentOptionIds.indexOf('*') > -1) {
      dataSource.ptSchedule.paymentOptions = [
        {
          name: '所有会卡',
          id: '*',
        }
      ];
    }

    this.setState({ dataSource });
  }

  // internal mehods

  async fetchUptoken () {
  }

  // modal callback functions

  dismissModal (refName) {
    this.setState({[refName + 'Visible']: false});
  }

  triggerModal (refName) {
    this.setState({[refName + 'Visible']: true});
  }

  render () {
    const dataSource = this.state.dataSource;
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
                      content: '删除后，请及时修改该教练的课程',
                      onOk: async () => {
                        await client.collaborator.delete(dataSource.id, dataSource.modifiedAt);
                        location.href = '/trainer/';
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

        <Row className='schedule'>
          <div className='card-header'>
            <h3>私教排期</h3>
            <ul className='actions'>
              {(() => {
                if (ptSchedule) {
                  return (
                    <li>
                      <Button
                        size='small'
                        onClick={() => {
                          const context = this;
                          UIFramework.Modal.confirm({
                            title: '确认取消私教排期?',
                            content: '取消私教排期后，将不能创建该教练的私教课程',
                            onOk: async () => {
                              await client.ptSchedule.delete(ptSchedule.id, ptSchedule.modifiedAt);
                              const dataSource = context.state.dataSource;
                              delete dataSource.ptSchedule;
                              context.setState({dataSource});
                            },
                          });
                        }}>
                        取消
                      </Button>
                    </li>
                  );
                }
              })()}
              <li>
                <Button size='small'
                        onClick={this.triggerModal.bind(this, 'ptScheduleModal')}>
                  编辑
                </Button>
              </li>
            </ul>            
          </div>
          <PTSchedule dataSource={ptSchedule} venueId={dataSource.venueId}/>
        </Row>

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
        <UIFramework.Modal
          ref="ptScheduleModal"
          footer=""
          title='私教排期'
          onCancel={this.dismissModal.bind(this, 'ptScheduleModal')}
          visible={this.state.ptScheduleModalVisible}>
          <TrainerSchedule
            schedule={ptSchedule}
            trainerId={this.props.id}
            onComplete={(ptSchedule) => {
              const trainer = Object.assign({}, dataSource, {ptSchedule});
              this.setState({
                ptScheduleModalVisible: false,
                dataSource: trainer,
              });
            }}/>
        </UIFramework.Modal>
      </div>
    );
  }
};
