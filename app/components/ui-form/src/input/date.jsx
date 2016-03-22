"use strict";

import React from 'react';
import { IControl } from '../base';

/**
 * @class UIDateInput
 */
class UIDateInput extends IControl {
  render() {
    const newProps = this.createProps({
      type: 'date',
    });
    return <input {...newProps} />;
  }
}

module.exports = UIDateInput;
