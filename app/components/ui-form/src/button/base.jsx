"use strict";

import React from 'react';
import { IControl } from '../base';

/**
 * @class UIButton
 * @extend UIContril
 */
class UIButton extends IControl {
  static propTypes = {
    /**
     * @property {String} text
     */
    text: React.PropTypes.string,
    /**
     * @property {String} level - primary, warning, error
     */
    level: React.PropTypes.oneOf([
      'primary', 'warning', 'error', 'default'
    ]),
    /**
     * @property {Boolean} block
     */
    block: React.PropTypes.bool,
    /**
     * @property {Boolean} disabled
     */
    disabled: React.PropTypes.bool,
    /**
     * @property {Number} disableInterval
     */
    disableInterval: React.PropTypes.number,
  };
  static styles = {
    button: {
      display: 'inline-block',
      height: '30px',
      border: '1px solid #9b9b9b',
      borderRadius: '4px',
      padding: '0 10px',
      color: '#7e7e7e',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all .3s ease-in-out',
      boxSizing: 'border-box',
    },
    disabled: {
      borderColor: '#eeeeee',
      color: '#eeeeee',
      cursor: 'no-drop',
    },
    block: {
      width: 'calc(100% - 5px)',
      display: 'block',
    },
    levels: {
      primary: {
        color: '#ffffff',
        borderColor: '#70CCA1',
        backgroundColor: '#70CCA1',
      }
    },
    hovered: {
      color: '#ffffff',
      borderColor: '#70CCA1',
      backgroundColor: '#70CCA1',
    }
  };
  
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      hovered: false,
      text: props.text,
    };
  }

  /**
   * @event onMouseOver
   */
  onMouseOver() {
    this.setState({
      hovered: true,
    });
  }

  /**
   * @event onMouseLeave
   */
  onMouseLeave() {
    this.setState({
      hovered: false,
    });
  }

  /**
   * Click this button has different behaviors
   *
   * @event onClick
   */
  async onClick(event) {
    this.setState({
      disabled: true
    });

    let isValid;
    if (typeof this.props.onClick === 'function') {
      isValid = await this.props.onClick(event);
    }
    if ((isValid === undefined || isValid) &&
      this.props.disableInterval !== undefined) {
      let count = this.props.disableInterval;
      let interval = setInterval(() => {
        count -= 1;
        if (count >= 0) {
          this.setState({
            text: `等待中(${count})`
          });
        } else {
          clearInterval(interval);
          this.setState({
            text: this.props.text,
            disabled: false,
          });
        }
      }, 1000);
    } else {
      this.setState({
        disabled: false,
      });
    }
  }

  render() {
    let disabled;
    if (this.state.disabled === true) {
      disabled = true;
    } else {
      disabled = this.props.disabled;
    }

    let srcProps = {};
    let style = Object.assign({}, UIButton.styles.button);
    if (disabled) {
      style = Object.assign(style, UIButton.styles.disabled);
    } else {
      if (this.state.hovered) {
        style = Object.assign(style, UIButton.styles.hovered);
      }
      srcProps.onMouseOver = this.onMouseOver.bind(this);
      srcProps.onMouseLeave = this.onMouseLeave.bind(this);
      srcProps.onClick = this.onClick.bind(this);
    }
    if (this.props.level) {
      const level = this.props.level;
      style = Object.assign(style, UIButton.styles.levels[level]);
    }
    if (this.props.block) {
      style = Object.assign(style, UIButton.styles.block);
    }

    srcProps.style = style;
    let newProps = this.createProps(srcProps);
    return (
      <button {...newProps}>
        {this.state.text}
      </button>
    );
  }
}

module.exports = UIButton;
