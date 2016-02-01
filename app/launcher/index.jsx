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
      barWidth: 0,
      barMaxWidth: 0,
      count: 1
    };
  }
  async componentDidMount() {
    this.inteval = setInterval(this.countUp.bind(this), 1000);
    window.onresize = () => {
      this.setState({height: window.innerHeight});
    };
    
    // start loading
    this.setState({
      hint: '正在加载用户信息(1/3)',
      barWidth: 5,
      barMaxWidth: 50
    });
    
    let intv1 = setInterval(this.addBarWidth.bind(this), 200);
    await client.user.getCurrent();
    clearInterval(intv1);

    // start loading 2/3
    this.setState({
      hint: '正在加载场馆信息(2/3)',
      barWidth: 60,
      barMaxWidth: 95
    });
    
    let intv2 = setInterval(this.addBarWidth.bind(this), 200);
    await client.org.getCurrent();
    clearInterval(intv2);

    // done
    this.setState({
      hint: '正在完成(3/3)',
      barWidth: 100,
      count: 0
    });
    // clear countUp
    clearInterval(this.inteval);
    // call onFinish with delay timeout
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
  addBarWidth(max) {
    if (this.state.barWidth >= this.state.barMaxWidth) {
      return;
    }
    this.setState({barWidth: this.state.barWidth + 2});
  }
  render() {
    let countDots = '';
    for (let i = 0; i < this.state.count; i++) {
      countDots += '.';
    }
    return (
      <div className="launch-screen-container" style={{height: this.state.height}}>
        <div className="launch-screen-topbar" style={{width: this.state.barWidth + '%'}}></div>
        <div className="launch-screen-content">
          <ClipLoader color="#696969" size="14" />
          <p>{this.state.hint} {countDots}</p>
        </div>
      </div>
    );
  }
}

exports.LaunchScreen = LaunchScreen;