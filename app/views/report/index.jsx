import React, { Component }  from 'react';
import ReportDetail from './detail';
import './index.css';

class ReportView extends Component {

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  get title () {
    return <h2>运营报表</h2>;
  }

  get actions () {
    return [];
  }

  render () {
    return <ReportDetail />;
  }
}

module.exports = ReportView;