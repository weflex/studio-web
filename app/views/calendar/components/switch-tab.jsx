"use strict";

import React from 'react';
import './switch-tab.css'

/**
 * @class SwitchTab
 * @extends React.Component
 */
export class SwitchTab extends React.Component {

  /**
   * @property {Object} propTypes - the props types
   * @static
   */
  static propTypes = {
    /**
     * @react.props {Array} options - The switch options, 
     * the item of this array is a value of string.
     */
    options: React.PropTypes.array,
    /**
     * @react.props {Function} onSwitch - the callback will be fired on switching actions.
     */
    onSwitch: React.PropTypes.func
  };

  /**
   * @method constructor
   * @param {Object} props
   */
  constructor (props) {
    super(props);
    this.state = {
      selectedIndex: Object.keys(props.options)[0]
    };
  }

  /**
   * @method setSelectedIndex
   * @param {Number} index - the selected index.
   */
  setSelectedIndex (index) {
    this.setState({ selectedIndex: index });
    this.props.onSwitch(this.state.selectedIndex);
  }

  /**
   * @method render
   */
  render () {
    return (
      <span className="calendar-switch-tab-wrapper">
        {
          Object.keys(this.props.options).map((key, _, keys) => {
            const style = {
              width: `${100 / keys.length}%`
            };
            if (key === this.state.selectedIndex) {
              style.color = '#fff';
              style.backgroundColor = '#00e4ff';
            }
            return (
              <span className="calendar-switch-tab-option" 
                    key={_} 
                    style={style} 
                    onClick={(e) => this.setSelectedIndex(key)}>
                {this.props.options[key]}
              </span>
            );
          })
        }
      </span>
    );
  }
}
