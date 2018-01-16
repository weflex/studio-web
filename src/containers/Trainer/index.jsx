import React from 'react';
import TrainerList from './list';
import TrainerDetail from './detail';
import './index.css';
import { FormattedMessage } from 'react-intl';

class TrainerView extends React.Component {
  // ToolBar control functions

  get title () {
    return <h2><FormattedMessage id="studio_web_trainer_management_page_title"/></h2>;
  }

  get actions () {
    return [];
  }

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

module.exports = TrainerView;
