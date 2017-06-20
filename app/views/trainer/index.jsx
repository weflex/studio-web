import React from 'react';
import TrainerList from './list';
import TrainerDetail from './detail';
import './index.css';

module.exports = class TrainerView extends React.Component {
  // ToolBar control functions 

  get title () {
    return <h2>教练管理</h2>;
  }

  get actions () {
    return [];
  }

  // internal functions

  render () {
    const result = window.location.pathname.match(/trainer(\/\w+)$/);
    let trainerId;
    if (result) {
      trainerId = result[1].substring(1);
      return <TrainerDetail trainerId={trainerId} />;
    } else {
      return <TrainerList />;
    }
  }
}
