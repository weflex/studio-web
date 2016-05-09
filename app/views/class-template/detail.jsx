"use strict";

import React from 'react';
import _ from 'lodash';
import { ClipLoader } from 'halogen';
import ImageCell from '../../components/image-cell';
import ImageManager from '../../components/image-manager';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
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
      imageManagerMode: 'multiple',
      imageManagerVisibled: false,
    };
  }
  
  async componentDidMount() {
    const venue = await client.user.getVenueById();
    const members = await client.collaborator.list({
      where: {
        or: [
          {
            orgId: venue.orgId
          },
          {
            venueId: venue.id
          }
        ],
      },
      include: ['roles'],
    });
    const trainers = members.filter((member) => {
      return member.roles.filter((role) => {
        return role.name === 'trainer';
      });
    });
    this.setState({
      trainers,
      loading: false
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
    try {
      await client.classTemplate.upsert(Object.assign({}, this.state.data));
    } catch (err) {
      if (err.code === 'RESOURCE_EXPIRED') {
        shouldRefresh = true;
      }
    }
    if (!shouldRefresh) {
      setTimeout(() => {
        this.props.app.router.navigate('/class/template/' + this.state.data.id);
        UIFramework.Message.success('保存模版成功');
      }, 0);
    } else {
      UIFramework.Modal.confirm({
        title: `当前数据已过期`,
        content: `当前数据已过期，点击确认刷新`,
        onOk: () => location.reload(),
      });
    }
  }

  onDelete() {
    UIFramework.Modal.confirm({
      title: '确认删除该课程模版？',
      content: '删除该课程模版将会使相关联的课程无法使用，即便如此，你也确认删除吗？',
      onOk: async () => {
        await client.classTemplate.delete(self.state.data.id);
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
    const trainerOptions = this.state.trainers.map(
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
              {text: '元'},
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
              {text: '分钟'},
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
        <UIFramework.Row name="选择教练" required={true}>
          <UIFramework.Select
            flex={1}
            bindStateCtx={this}
            bindStateName="data.trainerId"
            value={this.state.data.trainerId}
            options={trainerOptions}
          />
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
        <div>
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
        <div>
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
          <div className="detail-card" style={{height: '100%'}}>
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
            />
          </UIFramework.Modal>
        </div>
      </div>
    );
  }

}

module.exports = Detail;
