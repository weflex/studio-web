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
    if (this.props.name) {
      hint = (
        <div className="form-row-label">
          <Label
            required={this.props.required} 
            text={this.props.name} 
          />
          <HintText text={this.props.hint || ''} />
        </div>
      );
    }
    return (
      <div className="form-row">
        {hint}
        <div className="form-row-controls">
          {this.props.children}
        </div>
      </div>
    );
  }
}

class Control extends BindingComponent {
  constructor(props) {
    super(props);
    this.onChangeOnProps = null;
  }
  onInputChange(event) {
    this.onChange(event);
    if (typeof this.onChangeOnProps === 'function') {
      this.onChangeOnProps(event);
    }
  }
  createProps(obj) {
    if (this.props.onChange) {
      this.onChangeOnProps = this.props.onChange;
    }
    return Object.assign({}, {
      type: 'text',
      style: this.getStyle(),
      defaultValue: this.props.defaultValue || this.props.bindStateValue,
      onChange: this.onInputChange.bind(this),
    }, this.props, obj || {});
  }
  getStyle() {
    let style = {
      width: 'calc(100% - 5px)',
    };
    if (this.props.flex) {
      style.width = 'calc(' + (this.props.flex * 100) + '% - 5px)';
    }
    return style;
  }
}

class Input extends Control {
  constructor(props) {
    super(props);
  }
  className() {
    return Array.prototype.concat.apply(
      ['form-input'], arguments).join(' ');
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

class TextButton extends Control {
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
    let newProps = this.createProps({
      className: 'form-btn',
      disabled: this.props.disabled || this.state.disabled,
      onClick: this.onClick.bind(this),
    });
    if (!this.props.flex) {
      newProps.style.width = null;
    }
    return (
      <button {...newProps}>
        {this.props.text || this.props.children}
      </button>
    );
  }
}

class TextInput extends Input {
  render() {
    let newProps = this.createProps();
    if (this.props.multiline) {
      newProps.className = this.className('form-input-multiline');
      return <textarea {...newProps} />;
    } else {
      newProps.className = this.className();
      return <input {...newProps} />;
    }
  }
}

class DateInput extends Input {
  render() {
    let newProps = this.createProps({
      type: 'date',
      className: this.className('form-input-date'),
    });
    return <input {...newProps} />;
  }
}

class TimeInput extends Input {
  static defaultProps = {
    bindStateType: (val) => {
      const time = val.split(':');
      return {
        hour: parseInt(time[0], 10),
        minute: parseInt(time[1], 10),
      };
    },
  };
  render() {
    let newProps = this.createProps({
      type: 'time',
      className: this.className('form-input-time'),
    });
    return <input {...newProps} />;
  }
}

class FileInput extends BindingComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      dataUrls: []
    };
  }
  onFileUpload(event) {
    // stop default behaviors
    event.stopPropagation();
    event.preventDefault();
    let file = event.target.files[0];
    if (!file) {
      return;
    }
    if (typeof this.props.checkFile === 'function') {
      let err = this.props.checkFile(file);
      if (err) {
        // TODO(Yorkie): extend the alerting way
        return alert(err.displayMessage || err.message);
      }
    }
    // create reader
    const reader = new FileReader();
    reader.onload = this.onFileFinished.bind(this);
    reader.readAsDataURL(file);

    // setup for ui
    this.setState({
      value: file.name
    });
    // call onChange
    this.onChange(event);
  }
  async onFileFinished(event) {
    const content = event.target.result;
    // TODO(Yorkie|Scott): working with qiniu or API...
    // update to UIs
    let dataUrls = this.state.dataUrls;
    if (!this.props.multiple) {
      dataUrls = [content];
    } else {
      dataUrls.push(content);
    }
    this.setState({dataUrls});
  }
  preview() {
    if (!this.state.dataUrls.length) {
      return null;
    }
    let props = {
      className: 'form-file-preview',
    };
    if (this.props.multiple) {
      props.className += ' multiple';
    }
    return (
      <ul {...props}>
        {this.state.dataUrls.map((content, index) => {
          let onClose = () => {
            const dataUrls = this.state.dataUrls.filter((content, index_) => {
              return index !== index_;
            });
            this.setState({dataUrls});
          };
          return (
            <li key={index}>
              <div className="hover" onClick={onClose}></div>
              <img src={content} />
            </li>
          );
        })}
      </ul>
    );
  }
  render() {
    return (
      <div className="form-file-input">
        <div className="form-btn-group">
          <TextInput
            bindstateCtx={this}
            bindStateName="value"
            bindStateValue={this.state.value}
            placeholder={this.props.placeholder}
            flex={0.8}
          />
          <TextButton text="上传"
            flex={0.2} />
        </div>
        <input
          type="file"
          value={this.props.bindStateValue}
          onChange={this.onFileUpload.bind(this)}
        />
        {this.preview()}
      </div>
    );
  }
}

class OptionsPicker extends Control {
  componentDidMount() {
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
    let newProps = this.createProps({
      className: 'form-select',
      options: (this.props.options || []).map((item, index) => {
        return <option key={index} value={item.value}>{item.text}</option>;
      }),
    });
    return (
      <select {...newProps}>
        {(this.props.options || []).map((item, index) => {
          return <option key={index} value={item.value}>{item.text}</option>;
        })}
      </select>
    );
  }
}

class ColorPicker extends BindingComponent {
  constructor(props) {
    super(props);
    this.state = {
      colors: this.props.colors || [
        '#ff8ac2',
        '#6ed4a4',
        '#00e4ff',
        '#283547',
        '#f0ab51',
      ],
    };
  }
  onSelect(color) {
    this.onChange({
      target: {
        value: color
      }
    });
  }
  render() {
    const selected = this.props.bindStateValue || this.state.colors[0];
    return (
      <ul className="form-color-picker">
        {this.state.colors.map((color) => {
          return (
            <li key={color} 
              className={(selected === color ? 'selected' : '')}
              onClick={this.onSelect.bind(this, color)}>
              <div style={{backgroundColor: color}}></div>
            </li>
          );
        })}
      </ul>
    );
  }
}

exports.Form = Form;
exports.Row = Row;
exports.Label = Label;
exports.HintText = HintText;
exports.TextInput = TextInput;
exports.DateInput = DateInput;
exports.TimeInput = TimeInput;
exports.FileInput = FileInput;
exports.TextButton = TextButton;
exports.OptionsPicker = OptionsPicker;
exports.ColorPicker = ColorPicker;
