"use strict";

import React from 'react';
import _ from 'lodash';
import { DropModal } from 'boron2';
import { ClipLoader } from 'halogen';
import ImageCell from '../../components/image-cell';
import ImageManager from '../../components/image-manager';
import {
  Form,
  Row,
  TextInput,
  TextButton,
  Label,
  HintText,
  OptionsPicker
} from '../../components/form';
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
      imageManagerMode: 'multiple'
    };
  }
  
  async componentDidMount() {
    const venue = await client.user.getVenueById();
    const members = await client.orgMember.list({
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
    await client.classTemplate.upsert(Object.assign({}, this.state.data));
    setTimeout(() => {
      this.props.app.router.navigate('/class/template/' + this.state.data.id);
    }, 0);
  }

  async onDelete() {
    if (confirm('确认删除该课程模版')) {
      await client.classTemplate.delete(this.state.data.id);
      await this.props.updateMaster();
    }
  }
  
  makeOnOpenImageManager(title, mode, onFinish, data) {
    return () => {
      this.setState({
        imageManagerTitle: title,
        imageManagerMode: mode,
        onImageManagerFinish: onFinish.bind(this),
        imageManagerData: data,
      });
      this.refs.imageManagerModal.show();
    };
  }

  onCoverFinish(resources) {
    this.refs.imageManagerModal.hide();
    const newData = this.state.data;
    const res = resources[0];
    this.state.data.coverId = res.id;
    this.state.data.cover = res;
    this.setState({ data: newData });
  }

  onPhotosFinish(resources) {
    this.refs.imageManagerModal.hide();
    const newData = this.state.data;
    this.state.data.photoIds = _.map(resources, 'id');
    this.state.data.photos = resources;
    this.setState({ data: newData });
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
    let trainerOptions = this.state.trainers.map(
      item => {
        return {
          text: `${item.fullname.first} ${item.fullname.last}`,
          value: item.id
        };
      }
    );
    return (
      <div className="class-template-new-container">
        <Form className="class-template-new-form">
          <Row name="课程名" required={true}>
            <TextInput
              bindStateCtx={this} 
              bindStateName="data.name" 
              value={this.state.data.name}
            />
          </Row>
          <Row name="价格" required={true}>
            <TextInput 
              flex={0.8}
              bindStateCtx={this} 
              bindStateName="data.price"
              bindStateType={Number}
              value={this.state.data.price}
            />
            <OptionsPicker 
              flex={0.2}
              disabled={true}
              options={[
                {text: '元'},
              ]}
            />
          </Row>
          <Row name="课程时长" required={true}>
            <TextInput
              flex={0.8}
              bindStateCtx={this}
              bindStateName="data.duration"
              bindStateType={Number}
              value={this.state.data.duration}
            />
            <OptionsPicker 
              flex={0.2}
              disabled={true}
              options={[
                {text: '分钟'},
              ]}
            />
          </Row>
          <Row name="选择教练" required={true}>
            <OptionsPicker
              bindStateCtx={this}
              bindStateName="data.trainerId"
              value={this.state.data.trainerId}
              options={trainerOptions}
            />
          </Row>
          <Row name="课程描述" required={true}>
            <TextInput
              multiline={true}
              bindStateCtx={this}
              bindStateName="data.description"
              value={this.state.data.description}
            />
          </Row>
          <Row>
            <TextButton text="保存课程" onClick={this.onSave.bind(this)} />
          </Row>
        </Form>
        <div className="class-template-new-preview">
          <section className="cover">
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
          <section className="photos">
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
        </div>
        <DropModal ref="imageManagerModal">
          <ImageManager 
            title={this.state.imageManagerTitle} 
            mode={this.state.imageManagerMode}
            onFinish={this.state.onImageManagerFinish}
            data={this.state.imageManagerData}
          />
        </DropModal>
      </div>
    );
  }

}

module.exports = Detail;
