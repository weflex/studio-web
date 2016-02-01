"use strict";

import React from 'react';
import { ClipLoader } from 'halogen';
import './index.css';

class LaunchScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight,
      count: 1
    };
  }
  componentDidMount() {
    this.inteval = setInterval(this.countUp.bind(this), 500);
    window.onresize = () => {
      this.setState({height: window.innerHeight});
    };
  }
  componentWillUnmount() {
    clearInterval(this.inteval);
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
        <p>正在加载资源{countDots}</p>
      </div>
    );
  }
}

exports.LaunchScreen = LaunchScreen;