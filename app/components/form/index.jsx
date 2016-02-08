"use strict";

import React from 'react';
import { BindingComponent } from 'react-binding-component';
import './index.css';

class Form extends React.Component {
  render() {
    let className = 'form';
    if (this.props.className) {
      className += (' ' + this.props.className);
    }
    return <div className={className}>{this.props.children}</div>;
  }
}

class Row extends React.Component {
  render() {
    let hint = null;
    let labelOverStyle;
    if (this.props.hint) {
      hint = <HintText text={this.props.hint} />;
    } else {
      labelOverStyle = {
        width: '20%'
      };
    }
    return (
      <div className="form-row">
        <Label
          required={this.props.required} 
          text={this.props.name} 
          style={labelOverStyle}
        />
        <div className="form-row-controls">
          {this.props.children}
        </div>
        {hint}
      </div>
    );
  }
}

class TextInput extends BindingComponent {
  constructor(props) {
    super(props);
  }
  render() {
    let className = ['form-input'];
    let styles = {
      width: 'calc(100% - 5px)'
    };
    if (this.props.flex) {
      styles.width = 'calc(' + (this.props.flex * 100) + '% - 5px)';
    }
    if (this.props.multiline) {
      className.push('form-input-multiline');
      return (
        <textarea className={className.join(' ')} 
          style={styles}
          value={this.props.bindStateValue}
          placeholder={this.props.placeholder}
          onChange={this.onChange.bind(this)}>
        </textarea>
      );
    } else {
      return (
        <input
          type={this.props.password ? 'password' : 'text'}
          className={className.join(' ')}
          style={styles}
          value={this.props.bindStateValue}
          onChange={this.onChange.bind(this)}
          placeholder={this.props.placeholder}
        />
      );
    }
  }
}

class TextButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
  }
  async onClick(event) {
    this.setState({
      disabled: true
    });
    if (typeof this.props.onClick === 'function') {
      await this.props.onClick(event);
    }
    this.setState({
      disabled: false
    });
  }
  render() {
    let className = 'form-btn';
    let disabled = this.props.disabled || this.state.disabled;
    if (disabled) {
      className += ' disabled';
    }
    return (
      <button className={className}
        onClick={this.onClick.bind(this)}
        disabled={disabled}>
        {this.props.text}
      </button>
    );
  }
}

class OptionsPicker extends BindingComponent {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (!this.bindStateValue) {
      this.bindStateValue = this.props.options[0].value;
    }
  }
  render() {
    let styles = {
      width: 'calc(100% - 5px)'
    };
    if (this.props.flex) {
      styles.width = 'calc(' + (this.props.flex * 100) + '% - 5px)';
    }
    return (
      <select className="form-select" 
        style={styles}
        value={this.props.bindStateValue}
        onChange={this.onChange.bind(this)}>
        {(this.props.options || []).map((item, index) => {
          return <option key={index} value={item.value}>{item.text}</option>;
        })}
      </select>
    );
  }
}

class Label extends React.Component {
  render() {
    let className = null;
    if (this.props.required) {
      className = 'required';
    }
    return (
      <label className={className} style={this.props.style}>
        <span className="label-text">{this.props.text}</span>
      </label>
    );
  }
}

class HintText extends React.Component {
  render() {
    return (
      <div className="form-row-hint" style={this.props.style}>
        {this.props.text.split('\\n').map((line, index) => {
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  }
}

// class PriceControl extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       type: 1,
//       prices: []
//     };
//   }
//   render() {
//     return (
//       <div className="price-control">
//         <div className="price-select">
//           <OptionsPicker
//             stateCtx={this}
//             stateName="type"
//             options={[
//               {text: '1种价格', value: 1},
//               {text: '2种价格', value: 2},
//             ]}
//           />
//         </div>
//         <ul className="price-prices">
//           {_.range(1, Number(this.state.type) + 1).map((item, index) => {
//             return (
//               <li key={index}>
//                 <TextInput flex={0.7} placeholder="价格名称" />
//                 <TextInput flex={0.3} placeholder="价格" />
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     )
//   }
// }

exports.Form = Form;
exports.Row = Row;
exports.Label = Label;
exports.HintText = HintText;
exports.TextInput = TextInput;
exports.TextButton = TextButton;
exports.OptionsPicker = OptionsPicker;
