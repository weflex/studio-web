"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var ResItem;

class ResourcePanel extends React.Component {
  constructor (props) {
    ResItem = props.component;
    super(props);
    //TODO: get other contextual info from props.context;
    this.getData = props.getData;
    this.state = {
      actions: props.context.actions,
      resources: []
    };
  }

  async componentDidMount () {
    var data = await this.getData();
    this.setState({
      resources: data
    });
  }

  render () {
    return (
      <div className="resource-panel">
        <div className="resource-panel-actions">
          {this.state.actions.map((action) => {
            return <a>{action.title}</a>;
          })}
        </div>
        <ul className="resource-panel-items">
          {this.state.resources.map((item, index) => {
            return (
              <ResItem key={index} data={item} />
            );
          })}
        </ul>
      </div>
    );
  }
}

module.exports = ResourcePanel;
