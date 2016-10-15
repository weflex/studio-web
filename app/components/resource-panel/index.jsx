"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-component';
import { ClipLoader } from 'halogen';
import './index.css';

class ResourcePanel extends React.Component {
  constructor (props) {
    super(props);
    // TODO: (Scott)
    // get other contextual info from props.context;
    this.getData = props.getData;
    this.state = {
      actions: props.context.actions,
      resources: [],
      loading: true,
      itemsTop: 0
    };
  }

  onMouseWheel (event) {
    let nextItemsTop;
    const prevItemsTop = this.state.itemsTop || 0;
    const heightDelta  = this.refs.resourcePanel.offsetHeight - this.refs.resourcePanelItems.offsetHeight;
    console.log(heightDelta);
    if (heightDelta > 0) {
      nextItemsTop = 0;
    } else {
      nextItemsTop = Math.max(Math.min(0, this.state.itemsTop - event.deltaY * 0.5),
                              heightDelta - 30);
    }
    this.setState({
      itemsTop: nextItemsTop
    });
  }

  async componentDidMount () {
    var data = await this.getData();
    this.setState({
      resources: data,
      loading: false
    });
  }

  render () {
    let contentBody;
    if (this.state.loading) {
      contentBody = (
        <div className="resource-panel-loading">
          <ClipLoader color="#696969" size="12" />
          <p>正在加载资源...</p>
        </div>
      );
    } else {
      contentBody = (
        <ul className="resource-panel-items"
            ref="resourcePanelItems"
            style={{top: this.state.itemsTop}}
            onWheel={(event) => this.onMouseWheel(event)}>
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
      );
    }
    return (
      <div className="resource-panel" ref="resourcePanel">
            <div className="resource-panel-actions">
          {this.state.actions.map((action, index) => {
            return (
              <Link key={index} href={action.path}>{action.title}</Link>
            );
          })}
        </div>
        {contentBody}
      </div>
    );
  }
}

module.exports = ResourcePanel;
