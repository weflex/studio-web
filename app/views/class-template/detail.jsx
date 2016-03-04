"use strict";

import React from 'react';
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
  
  makeOnOpenImageManager(title, mode) {
    return () => {
      this.setState({
        imageManagerTitle: title,
        imageManagerMode: mode,
      });
      this.refs.imageManagerModal.show();
    };
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
              bindStateCtx={this} 
              bindStateName="data.price"
              bindStateType={Number}
              bindStateValue={this.state.data.price}
            />
          </Row>
          <Row name="课程时长" required={true}>
            <TextInput
              bindStateCtx={this}
              bindStateName="data.during"
              bindStateType={Number}
              bindStateValue={this.state.data.during}
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
                onClick={this.makeOnOpenImageManager.call(this, '选择封面图片', 'single')}
              />
            </div>
          </section>
          <section className="photos">
            <h3>图片</h3>
            <div>
              {(this.state.data.photos || []).map((src) => {
                return (
                  <ImageCell 
                    src={src} 
                    onClick={this.makeOnOpenImageManager.call(this, '选择课程图片', 'multiple')}
                  />
                );
              })}
              <ImageCell 
                description="this is for adding new photo"
                onClick={this.makeOnOpenImageManager.call(this, '选择课程图片', 'multiple')}
              />
            </div>
          </section>
        </div>
        <DropModal ref="imageManagerModal">
          <ImageManager 
            title={this.state.imageManagerTitle} 
            mode={this.state.imageManagerMode}
          />
        </DropModal>
      </div>
    );
  }

}

module.exports = Detail;
