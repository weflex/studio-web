"use strict";

import React from 'react';
const DEFAULT_BACKGROUND_COLOR = '#9b9b9b';

/**
 * @class UIDashedBox
 */
class UIDashedBox extends React.Component {
  static propTypes = {
    /**
     * @property {String} className - the class name of the container element
     */
    className: React.PropTypes.string,

    /**
     * @property {Number} height - the box height
     */
    height: React.PropTypes.number,

    /**
     * @property {Number} width - the box width
     */
    width: React.PropTypes.number,

    /**
     * @property {Function} onClick - the onClick function
     */
    onClick: React.PropTypes.func,

    /**
     * @property {String} text - the text
     * @required
     */
    text: React.PropTypes.string.isRequired,
  };
  
  static styles = {
    container: {
      border: '1px dashed ' + DEFAULT_BACKGROUND_COLOR,
      textAlign: 'center',
      borderRadius: '5px',
      boxSizing: 'border-box',
      fontSize: '14px',
      transition: 'all .2s ease-in-out',
    },
    contents: {
      transition: 'all .2s ease-in-out',
    }
  };
  
  /**
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      color: DEFAULT_BACKGROUND_COLOR,
    };
  }

  /**
   * @event onMouseOver
   */
  onMouseOver() {
    this.setState({
      color: '#666666',
    });
  }

  /**
   * @event onMouseLeave
   */
  onMouseLeave() {
    this.setState({
      color: DEFAULT_BACKGROUND_COLOR,
    });
  }

  render() {
    const containerStyl = Object.assign({
      height: this.props.height,
      width: this.props.width,
      color: this.state.color,
      borderColor: this.state.color,
    }, UIDashedBox.styles.container);
    const contentsStyl = Object.assign({
      marginTop: this.props.height / 2 - 14,
    }, UIDashedBox.styles.contents);
    return (
      <div style={containerStyl}
        onClick={this.props.onClick}
        onMouseOver={this.onMouseOver.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}>
        <p style={contentsStyl}>
          {this.props.text}
        </p>
      </div>
    );
  }
}

module.exports = {
  UIDashedBox,
};
