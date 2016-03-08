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
    this.setState({
      trainers: await client.trainer.list(),
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
    return [
      {
        title: '返回',
        path: '/class/template'
      }
    ];
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
  
  async onSubmit() {
    await client.classTemplate.upsert(this.state.data);
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
              bindStateValue={this.state.data.name}
            />
          </Row>
          <Row name="价格" required={true}>
            <TextInput 
              flex={0.7}
              bindStateCtx={this} 
              bindStateName="data.price"
              bindStateType={Number}
              bindStateValue={this.state.data.price}
            />
            <OptionsPicker 
              flex={0.3}
              disabled={true}
              bindStateCtx={this}
              options={[
                {text: '元'},
              ]}
            />
          </Row>
          <Row name="课程时长" required={true}>
            <TextInput
              flex={0.7}
              bindStateCtx={this}
              bindStateName="data.during"
              bindStateType={Number}
              bindStateValue={this.state.data.during}
            />
            <OptionsPicker 
              flex={0.3}
              disabled={true}
              bindStateCtx={this}
              options={[
                {text: '分钟'},
              ]}
            />
          </Row>
          <Row name="选择教练" required={true}>
            <OptionsPicker
              bindStateCtx={this}
              bindStateName="data.trainerId"
              bindStateValue={this.state.data.trainerId}
              options={trainerOptions}
            />
          </Row>
          <Row name="课程描述" required={true}>
            <TextInput
              multiline={true}
              bindStateCtx={this}
              bindStateName="data.description"
              bindStateValue={this.state.data.description}
            />
          </Row>
          <Row>
            <TextButton text={this.props.data ? '保存修改' : '确认添加'}
              onClick={this.onSubmit.bind(this)} 
              disabled={this.disabled}
            />
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
