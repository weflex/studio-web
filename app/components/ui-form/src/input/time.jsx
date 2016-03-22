"use strict";

import React from 'react';
import { IControl } from '../base';

/**
 * @class UITimeInput
 */
class UITimeInput extends IControl {
  render() {
    const newProps = this.createProps({
      type: 'time',
    });
    return <input {...newProps} />;
  }
}

module.exports = UITimeInput;
