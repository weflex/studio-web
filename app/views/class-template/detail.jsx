"use strict";

import React from 'react';
import _ from 'lodash';
import { ClipLoader } from 'halogen';
import ImageCell from '../../components/image-cell';
import ImageManager from '../../components/image-manager';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../api';
import { Select } from 'antd';
const Option = Select.Option;
import './detail.css';

class Detail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      venues: [],
      trainers: [],
      loading: true,
      data: this.props.data || {
        name: null,
        price: null,
        trainerId: null,
        coverId: null,
        photoIds: [],
      },
      classPackages: [],
      imageManagerMode: 'multiple',
      imageManagerVisibled: false,
    };
  }

  async componentDidMount() {
    const venue = await client.user.getVenueById();
    const members = await client.collaborator.list({
      where: {
        venueId: venue.id,
        trashedAt: {
          exists: false
        }
      },
      include: ['roles'],
    });
    let classPackages = await client.classPackage.list({
      where: {
        venueId: venue.id
      },
    });
    const anyClassPackage = {
      id: '*',
      name: '所有会卡'
    };
    classPackages = [anyClassPackage, ...classPackages];
    const trainers = _.filter(members, (member) => {
      if (this.state.data.trainerId == member.id) {
        this.setState({
          defaultTrainer: true
        })
      }
      return _.includes(member.roleIds, 'trainer');
    });
    this.setState({
      trainers,
      loading: false,
      classPackages,
    });
  }

  get title() {
    if (this.props.data) {
      return this.props.data.name;
    } else {
      return '添加新的课程模版';
    }
  }

  get actions() {
    let list = [];
    if (this.state.data.id) {
      list.push({
        title: '删除课程',
        onClick: this.onDelete.bind(this),
        disableToggled: true,
      });
    }
    list.push({
      title: '保存课程',
      onClick: this.onSave.bind(this),
      disableToggled: true,
    });
    return list;
  }

  get disabled() {
    if (!this.state.data.name ||
      !this.state.data.price ||
      !this.state.data.trainerId ||
      !this.state.data.description) {
      return true;
    } else {
      return false;
    }
  }

  async onSave() {
    let shouldRefresh = false;
    let resp;
    const { name, spot, price, paymentOptionIds,duration, description, trainerId ,id,modifiedAt} = this.state.data;
    const errorMessage = [];
    if (!name) {
      errorMessage.push('`课程名`');
    }
    if (!Number.isInteger(spot) || spot <= 0) {
      errorMessage.push('`课位`');
    }
    if (!Number.isInteger(price) || price < 0) {
      errorMessage.push('`价格`');
    }
    if (!paymentOptionIds || paymentOptionIds.length <= 0) {
      errorMessage.push('`可用会卡`');
    }
    if (!description) {
      errorMessage.push('`课程描述`');
    }
    if (!trainerId) {
      errorMessage.push('`请选择教练`');
    }
    if (errorMessage.length > 0) {
      return UIFramework.Message.error('请正确输入' + errorMessage.join('和') + '后确认保存。');
    }
    try {
      if(id){
        resp = await client.classTemplate.request(
          id,
           'PATCH',
           {
             duration,
             name,
             spot,
             price,
             paymentOptionIds,
             description,
             trainerId
           }
       );
      }else{
        resp = await client.classTemplate.upsert(Object.assign({}, this.state.data));
      }
     
      if (this.props.updateMaster) {
        this.props.updateMaster()
      }
    } catch (err) {
      if (err.code === 'RESOURCE_EXPIRED') {
      } else {
        UIFramework.Message.error('保存模版失败');
        console.error(err);
      }
    }
    if (!this.state.data || !this.state.data.id) {
      this.props.app.router.navigate('/class/template/' + resp.id);
    }
  }

  onDelete() {
    let self = this;
    UIFramework.Modal.confirm({
      title: '确认删除该课程模版？',
      content: '删除该课程模版将会使相关联的课程无法使用，即便如此，你也确认删除吗？',
      onOk: async () => {
        await client.classTemplate.delete(self.state.data.id, self.state.data.modifiedAt);
        await self.props.updateMaster();
      }
    });
  }

  makeOnOpenImageManager(title, mode, onFinish, data) {
    return () => {
      this.setState({
        imageManagerVisibled: true,
        imageManagerTitle: title,
        imageManagerMode: mode,
        onImageManagerFinish: onFinish.bind(this),
        imageManagerData: data,
      });
    };
  }

  hideImageManager() {
    this.setState({
      imageManagerVisibled: false,
    });
  }

  onCoverFinish(resources) {
    const newData = this.state.data;
    const res = resources[0];
    this.state.data.coverId = res.id;
    this.state.data.cover = res;
    this.setState({
      data: newData,
      imageManagerVisibled: false,
    });
  }

  onPhotosFinish(resources) {
    const newData = this.state.data;
    this.state.data.photoIds = _.map(resources, 'id');
    this.state.data.photos = resources;
    this.setState({
      data: newData,
      imageManagerVisibled: false,
    });
  }

  form() {
    let trainerOptions = this.state.trainers.map(
      item => {
        return {
          text: `${item.fullname.first} ${item.fullname.last}`,
          value: item.id
        };
      }
    );
    return (
      <UIFramework className="class-template-new-form">
        <UIFramework.Row name="课程名" required={true}>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="data.name"
            value={this.state.data.name}
          />
        </UIFramework.Row>
        <UIFramework.Row name="价格" required={true}>
          <UIFramework.TextInput
            flex={0.8}
            bindStateCtx={this}
            bindStateName="data.price"
            bindStateType={Number}
            value={this.state.data.price}
          />
          <UIFramework.Select
            flex={0.2}
            disabled={true}
            options={[
              { text: '元' },
            ]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="课程时长" required={true}>
          <UIFramework.TextInput
            flex={0.8}
            bindStateCtx={this}
            bindStateName="data.duration"
            bindStateType={Number}
            value={this.state.data.duration}
          />
          <UIFramework.Select
            flex={0.2}
            disabled={true}
            options={[
              { text: '分钟' },
            ]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="课位" required={true}>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="data.spot"
            bindStateType={Number}
            value={this.state.data.spot}
          />
        </UIFramework.Row>
        <UIFramework.Row name="选择教练" >
          <Select
            style={{ width: '100%' }}
            defaultValue={this.state.defaultTrainer ? this.state.data.trainerId : '请选择教练'}
            placeholder="选择教练"
            onChange={(value) => {
              let data = this.state.data
              data.trainerId = value
              this.setState({
                data
              })
            }}>
            {
              trainerOptions.map((trainer, key) => {
                return <Option value={trainer.value} key={key}>{trainer.text}</Option>
              })
            }
          </Select>
        </UIFramework.Row>
        <UIFramework.Row name="可用会卡" hint="可以用于预约该课程的会卡种类">
          <Select
            mode='multiple'
            style={{ width: '100%' }}
            value={this.state.data.paymentOptionIds}
            onSelect={(value) => {
              let paymentOptionIds;
              if ('*' === value) {
                paymentOptionIds = ['*'];
              } else {
                paymentOptionIds = this.state.data.paymentOptionIds || [];
                paymentOptionIds = paymentOptionIds.filter((opt) => opt !== '*');
                paymentOptionIds.push(value);
              }
              if (paymentOptionIds.length === this.state.classPackages.length - 1) {
                paymentOptionIds = ['*'];
              }
              this.setState({ data: Object.assign(this.state.data, { paymentOptionIds }) });
            }}
            onDeselect={(value) => {
              const paymentOptionIds = this.state.data.paymentOptionIds;
              const index = paymentOptionIds.indexOf(value);
              if (index > -1) {
                paymentOptionIds.splice(index, 1);
                this.setState({ data: Object.assign(this.state.data, { paymentOptionIds }) });
              }
            }}>{
              this.state.classPackages.map((membership, key) =>
                <Option value={membership.id} key={key}>{membership.name}</Option>
              )
            }</Select>
        </UIFramework.Row>
        <UIFramework.Row name="课程描述" required={true}>
          <UIFramework.TextInput
            flex={1}
            multiline={true}
            bindStateCtx={this}
            bindStateName="data.description"
            value={this.state.data.description}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }

  cover() {
    return (
      <section className="class-template-detail-cover">
        <h3>封面</h3>
        <div >
          <ImageCell
            src={this.state.data.cover}
            onClick={this.makeOnOpenImageManager.call(
              this,
              '选择封面图片',
              'single',
              this.onCoverFinish,
              this.state.data.cover)}
          />
        </div>
      </section>
    );
  }

  photos() {
    return (
      <section className="class-template-detail-photos">
        <h3>图片</h3>
        <div >
          {(this.state.data.photos || []).map((src, index) => {
            return (
              <ImageCell
                key={index}
                src={src}
                onClick={this.makeOnOpenImageManager.call(
                  this,
                  '选择课程图片',
                  'multiple',
                  this.onPhotosFinish,
                  this.state.data.photos)}
              />
            );
          })}
          <ImageCell
            description="this is for adding new photo"
            onClick={this.makeOnOpenImageManager.call(
              this,
              '选择课程图片',
              'multiple',
              this.onPhotosFinish,
              this.state.data.photos)}
          />
        </div>
      </section>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="class-template-loading">
          <ClipLoader color="#696969" size="14" />
          <p>正在加载教练信息...</p>
        </div>
      );
    }
    return (
      <div className="detail-cards class-template-detail-container">
        <div className="detail-cards-left">
          <div className="detail-card" style={{ height: '100%' }}>
            {this.form()}
          </div>
        </div>
        <div className="detail-cards-right">
          <div className="detail-card">
            {this.cover()}
          </div>
          <div className="detail-card">
            {this.photos()}
          </div>
          <UIFramework.Modal
            footer=""
            title={this.state.imageManagerTitle}
            visible={this.state.imageManagerVisibled}
            onCancel={this.hideImageManager.bind(this)}>
            <ImageManager
              mode={this.state.imageManagerMode}
              onFinish={this.state.onImageManagerFinish}
              data={this.state.imageManagerData}
              size={5}
            />
          </UIFramework.Modal>
        </div>
      </div>
    );
  }

}

module.exports = Detail;
