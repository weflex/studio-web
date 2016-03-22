"use strict";

import React from 'react';
import { BindingComponent } from 'react-binding-component';

/**
 * @class UIColorItem
 */
class UIColorItem extends React.Component {
  static propTypes = {
    /**
     * @property {String} color
     */
    color: React.PropTypes.string,
    /**
     * @property {Boolean} selected
     */
    selected: React.PropTypes.bool,
    /**
     * @property {Function} onClick
     */
    onClick: React.PropTypes.func,
  };
  static styles = {
    container: {
      display: 'inline-block',
      border: '1px solid #e6e6e6',
      borderRadius: '2px',
      marginRight: '5px',
      cursor: 'pointer',
      boxSizing: 'border-box',
      transition: 'all .2s ease-in-out'
    },
    content: {
      display: 'block',
      height: '20px',
      width: '20px',
      margin: '6px',
    },
    active: {
      backgroundColor: '#ebebeb',
    },
  };

  /**
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  /**
   * @event onMouseOver
   */
  onMouseOver() {
    this.setState({active: true});
  }

  /**
   * @event onMouseLeave
   */
  onMouseLeave() {
    this.setState({active: false});
  }

  render() {
    let containerStyl = Object.assign({}, 
      UIColorItem.styles.container);
    let contentStyl = Object.assign({
      backgroundColor: this.props.color,
    }, UIColorItem.styles.content);
    if (this.props.selected || this.state.active) {
      containerStyl = Object.assign(containerStyl, 
        UIColorItem.styles.active);
    }
    return (
      <li style={containerStyl}
        onClick={this.props.onClick}
        onMouseOver={this.onMouseOver.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}>
        <div style={contentStyl}></div>
      </li>
    );
  }
}

/**
 * @class UIColorPicker
 * @extends BindingComponent
 */
class UIColorPicker extends BindingComponent {
  static propTypes = {
    /**
     * @property {Array} colors - the colors
     */
    colors: React.PropTypes.arrayOf(React.PropTypes.string),
  };
  static defaultProps = {
    colors: [
      '#ff8ac2',
      '#6ed4a4',
      '#00e4ff',
      '#283547',
      '#f0ab51',
    ],
  };
  constructor(props) {
    super(props);
    this.state = {
      colors: this.props.colors,
    };
  }
  componentWillMount() {
    if (this.props.bindStateCtx && !this.bindStateValue) {
      this.bindStateValue = this.state.colors[0];
    }
  }
  onSelect(color) {
    this.onChange({
      target: {
        value: color
      }
    });
  }
  render() {
    const selected = this.bindStateValue || this.state.colors[0];
    return (
      <ul className="form-color-picker">
        {this.state.colors.map((color) => {
          return (
            <UIColorItem
              key={color}
              color={color}
              selected={selected === color} 
              onClick={this.onSelect.bind(this, color)} 
            />
          );
        })}
      </ul>
    );
  }
}

module.exports = UIColorPicker;