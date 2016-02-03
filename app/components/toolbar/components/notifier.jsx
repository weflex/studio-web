"use strict";

import React from 'react';

export class Notifier extends React.Component {
  render () {
    return (
      <div className='notifier'>
        <span className='notifier-spot'></span>
        <i className='icon-font icon-inbox'></i>
      </div>
    );
  }
}
