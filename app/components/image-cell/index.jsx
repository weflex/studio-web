"use strict";

import React from 'react';
import './index.css';

/**
 * @class ImageCell
 */
class ImageCell extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      /**
       * @state {Boolean} isSelected - flag if selected
       */
      isSelected: props.selected || false,
    };
  }

  onClick(event) {
    if (this.props.selectable) {
      this.setState({
        isSelected: !this.state.isSelected,
      });
    }
    if (typeof this.props.onClick === 'function') {
      this.props.onClick.call(this, event, this.props.src);
    }
  }

  onTypeFileSelect(event) {
    // stop default behaviors
    event.stopPropagation();
    event.preventDefault();

    // check files
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const errs = [];
    const returns = [];
    for (let idx = 0; idx < files.length; idx++) {
      let err = this.checkFile(files[idx], idx);
      if (err instanceof Error) {
        errs.push(err);
      } else {
        returns.push(files[idx]);
      }
    }
    if (errs.length > 0) {
      return window.alert(errs.reduce((text, err) => {
        text += '- ' + (err.displayMessage || err.message) + '\n';
        return text;
      }, ''));
    } else {
      if (typeof this.props.onFilesSelect !== 'function') {
        console.warn('initialize ImageCell with file type, but onFilesSelect prop not found');
      } else {
        this.props.onFilesSelect(returns);
      }
    }
  }

  checkFile(file, index) {
    if (file.type !== 'image/png' &&
      file.type !== 'image/jpg' &&
      file.type !== 'image/jpeg' &&
      file.type !== 'image/gif') {
      let err = new TypeError('image required');
      err.displayMessage = `文件(${file.name})不是图片格式：.png, .jpg, .jpeg, .gif`;
      return err;
    }
    if (file.size > 2*1024*1024) {
      let err = new Error('image size should less than 2M');
      err.displayMessage = `文件(${file.name})大小必须小于2M`;
      return err;
    }
    return null;
  }
  
  render() {
    let className = 'image-cell';
    let bg = null;
    let checkmark = null;
    let hint = this.props.hint || [
      <span key="icon">+</span>,
      <span key="text">点击上传图片</span>,
    ];
    
    if (this.props.src && this.props.src.uri) {
      bg = <img src={this.props.src.uri} width="100%" height="100%" className="background"/>;
      hint = '点击更换图片';
    } else {
      className += ' image-cell-empty';
    }

    if (this.props.selectable) {
      className += ' selectable';
      if (this.state.isSelected) {
        className += ' selected';
        hint = '';
      }
    }

    let fileInput = null;
    if (this.props.type === 'file') {
      fileInput = <input type="file" 
        multiple={this.props.multiple} onChange={this.onTypeFileSelect.bind(this)} />;
    }

    return (
      <div className={className}>
        {bg}
        <div className="hint" onClick={this.onClick.bind(this)}>
          {hint}
          {fileInput}
        </div>
      </div>
    );
  }
}

module.exports = ImageCell;
