"use strict"

import React from 'react';
import { IControl } from '../base';

/**
 * @class UIOptionPicker
 */
class UIOptionPicker extends IControl {
  static propTypes = {
    /**
     * @property {Array} options
     */
    options: React.PropTypes.array.isRequired,
  };
  static defaultProps = {
    options: [
      {text: '未选择', value: undefined}
    ],
  };

  componentWillMount() {
    if (this.props.bindStateCtx && !this.bindStateValue) {
      this.bindStateValue = this.props.options[0].value;
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    const prevOptions = JSON.stringify(prevProps.options);
    const currOptions = JSON.stringify(this.props.options);
    if (prevOptions !== currOptions) {
      const options = this.props.options[0];
      this.onInputChange({
        target: {
          value: options.value || options.text
        }
      });
    }
  }
  
  render() {
    const newProps = this.createProps();
    return (
      <select {...newProps}>
        {(this.props.options).map((item, index) => {
          return <option key={index} value={item.value}>{item.text}</option>;
        })}
      </select>
    );
  }
}

module.exports = UIOptionPicker;