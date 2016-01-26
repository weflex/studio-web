"use strict";

import React from 'react';
import {
  BeatLoader
} from 'halogen';
import './new.css';
const client = require('@weflex/gian').getClient('dev');

class NewClassTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venues: [],
      trainers: [],
      loading: true
    };

    this.newClass = {}
  }

  async componentDidMount() {
    if (this.state.isModalShow) {
      this.setState({
        venues: await client.venue.list(),
        trainers: await client.trainer.list(),
        loading: false
      });
    }
  }

  onCreateClass() {
    // update class 
    // this.props.onCreateClass(newClass);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="class-template-loading">
          <BeatLoader color="#777" />
          <p>正在载入资源</p>
        </div>
      );
    }
    return (
      <div className="class-template-new-container">
        <h1>新建课程</h1>
        <div className="class-template-new-form">
          <div className="class-template-fieldset">
            <label>课程名</label>
            <input type="text" />
          </div>
          <div className="class-template-fieldset">
            <label>定价</label>
            <input type="text" />
          </div>
          <div className="class-template-fieldset">
            <label>选择工作室</label>
            <select>
              {this.state.venues.map((venue, index) => {
                return <option key={index}>{venue.name}</option>;
              })}
            </select>
          </div>
          <div className="class-template-fieldset">
            <label>选择教练</label>
            <select>
              {this.state.trainers.map((trainer, index) => {
                return <option key={index}>{trainer.fullname.first}</option>;
              })}
            </select>
          </div>
          <div className="class-template-fieldset">
            <label>开始时间</label>
            <input 
              type="text" 
              defaultValue={this.props.from} 
            />
          </div>
          <div className="class-template-fieldset">
            <label>结束时间</label>
            <input
              type="text"
              defaultValue={this.props.to}
            />
          </div>
          <div className="class-template-fieldset">
            <label>日期</label>
            <input 
              type="text"
              defaultValue={this.props.date}
            />
          </div>
        </div>
        <div className="class-template-footer">
          <button onClick={this.onCreateClass.bind(this)}>创建课程</button>
        </div>
      </div>
    );
  }
}

exports.NewClassTemplate = NewClassTemplate;
