"use strict";

import React from 'react';
import { ClipLoader } from 'halogen';
import { client } from '../api';
import './index.css';

class LaunchScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight,
      hint: '准备加载资源(0/3)',
      count: 1
    };
  }
  async componentDidMount() {
    this.inteval = setInterval(this.countUp.bind(this), 1000);
    window.onresize = () => {
      this.setState({height: window.innerHeight});
    };
    //
    this.setState({
      hint: '正在加载用户信息(1/3)'
    });
    await client.user.getCurrent();
    this.setState({
      hint: '正在加载场馆信息(2/3)'
    });
    await client.org.getCurrent();
    clearInterval(this.inteval);
    this.setState({
      hint: '完成(3/3)',
      count: 0
    });
    setTimeout(this.props.onFinish, 800);
  }
  componentWillUnmount() {
    window.onresize = null;
  }
  countUp() {
    if (this.state.count >= 5) {
      this.setState({count: 0});
    } else {
      this.setState({
        count: this.state.count + 1
      });
    }
  }
  render() {
    let countDots = '';
    for (let i = 0; i < this.state.count; i++) {
      countDots += '.';
    }
    return (
      <div className="launch-screen-container" style={{height: this.state.height}}>
        <ClipLoader color="#696969" size="14" />
        <p>{this.state.hint} {countDots}</p>
      </div>
    );
  }
}

exports.LaunchScreen = LaunchScreen;