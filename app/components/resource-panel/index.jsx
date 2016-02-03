"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-component';
import './index.css';

class ResourcePanel extends React.Component {
  constructor (props) {
    super(props);
    // TODO: (Scott)
    // get other contextual info from props.context;
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
          {this.state.actions.map((action, index) => {
            return (
              <Link key={index} href={action.path}>{action.title}</Link>
            );
          })}
        </div>
        <ul className="resource-panel-items">
          {this.state.resources.map((item, index) => {
            return (
              <this.props.component 
                key={index} 
                data={item} 
                {...this.props.context} 
              />
            );
          })}
        </ul>
      </div>
    );
  }
}

module.exports = ResourcePanel;
