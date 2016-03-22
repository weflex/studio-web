"use strict";

import React from 'react';
import { BindingComponent } from 'react-binding-component';
import './base.css';

/**
 * @class UIForm
 */
class UIForm extends React.Component {
  static propTypes = {
    /**
     * @property {String} className
     */
    className: React.PropTypes.string,
    /**
     * @property {React.PropTypes.Node} children
     */
    children: React.PropTypes.node,
  };
  static styles = {
    form: {
      padding: '5px',
      fontSize: '14px',
    },
  };
  render() {
    let className = 'ui-form';
    if (this.props.className &&
      this.props.className !== className) {
      className += (' ' + this.props.className);
    }
    return (
      <div className={className}
        style={UIForm.styles.form}>
        {this.props.children}
      </div>
    );
  }
}

/**
 * @class UIText
 */
class UIText extends React.Component {
  static propTypes: {
    /**
     * @property {String} className
     */
    className: React.PropTypes.string,
    /**
     * @property {String} text - the text to display
     */
    text: React.PropTypes.string.isRequired,
  };
  static defaultProps = {
    text: '',
  };
  static styles = {
    container: {
      color: '#9b9b9b',
      fontSize: '12px',
      display: 'inline-block',
      verticalAlign: 'bottom',
    },
  };
  render() {
    return (
      <div className={this.props.className} 
        style={UIText.styles.container}>
        {this.props.text.split('\\n').map((line, key) => {
          return <p key={key}>{line}</p>;
        })}
      </div>
    );
  }
}


/**
 * @class UILabel
 */
class UILabel extends React.Component {
  static propTypes = {
    /**
     * @property {String} className
     */
    className: React.PropTypes.string,
    /**
     * @property {String} text
     */
    text: React.PropTypes.string,
  };
  static styles = {
    container: {
      color: '#595959',
      fontSize: '14px',
      display: 'inline-block',
    },
    text: {
      marginRight: '10px',
    },
  };
  render() {
    return (
      <label className={this.props.className}
        style={UILabel.styles.container}>
        <span style={UILabel.styles.text}>{this.props.text}</span>
      </label>
    );
  }
}

/**
 * @class UIRow
 */
class UIRow extends React.Component {
  static propTypes: {
    /**
     * @property {String} name - the row name
     */
    name: React.PropTypes.string,
    /**
     * @property {String} hint - the hint text
     */
    hint: React.PropTypes.string,
    /**
     * @property {Boolean} required - if true, this row value is required
     */
    required: React.PropTypes.bool,
    /**
     * @property {React.PropTypes.node} children
     */
    children: React.PropTypes.node,
  };
  
  static styles = {
    container: {
      marginBottom: '15px',
    },
    label: {
      marginBottom: '5px',
    },
    controls: {
      boxSizing: 'border-box',
      width: '100%',
    },
  };
  
  render() {
    let hint = null;
    if (this.props.name) {
      hint = (
        <div style={UIRow.styles.label}>
          <UILabel text={this.props.name} 
            required={this.props.required} />
          <UIText text={this.props.hint} />
        </div>
      );
    }
    return (
      <div className="ui-form-row"
        style={UIRow.styles.container}>
        {hint}
        <div style={UIRow.styles.controls}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

/**
 * @class Control
 * @extends BindingComponent
 */
class IControl extends BindingComponent {
  static propTypes: {
    /**
     * @property {Number} flex - the flexbox value
     */
    flex: React.PropTypes.number,
    /**
     * @property {Function} onChange - onChange function
     */
    onChange: React.PropTypes.func,
  };

  /**
   * @getter {String} with - the width string of the instance by IControl
   */
  get width() {
    let val = 'calc(100% - 5px)';
    if (this.props.flex) {
      val = 'calc(' + (this.props.flex * 100) + '% - 5px)';
    }
    return val;
  }

  /**
   * @constructor
   */
  constructor(props) {
    super(props);
    this.onChangeOnProps = null;
  }

  componentDidMount() {
    if (this.props.bindStateCtx && !this.bindStateValue) {
      this.bindStateValue = this.props.value || this.props.defaultValue;
    }
  }

  onInputChange(event) {
    this.onChange(event);
    if (typeof this.onChangeOnProps === 'function') {
      this.onChangeOnProps(event);
    }
  }

  /**
   * return the props object
   *
   * @method createProps
   * @param {Object} obj - the extend obj
   * @return {Object}
   */
  createProps(obj) {
    if (this.props.onChange) {
      this.onChangeOnProps = this.props.onChange;
    }
    const props = Object.assign({
      type: 'text'
    }, this.props, {
      onChange: this.onInputChange.bind(this),
    }, obj || {});
    props.style = props.style || {};
    if (typeof props.style.width !== 'string') {
      props.style.width = this.width;
    }
    return props
  }
  
}

module.exports = {
  UIForm,
  UIText,
  UILabel,
  UIRow,
  IControl,
};
