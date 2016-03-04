"use strict";

import React from 'react';
import { BlurView } from '../blur';
import './index.css';

/**
 * @class ImageCell
 */
class ImageCell extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      /**
       * @state {Number} blurRadius - blur radius
       */
      blurRadius: 0.0,
      /**
       * @state {Boolean} isBluring - flag the action
       */
      isBluring: false,
    };
  }
  
  blurOrClear(expect, step = 1) {
    let self = this;
    let op;
    if (!self.props.src || !self.props.src.uri) {
      return;
    }
    if (expect >= self.state.blurRadius) {
      op = 'plus';
      this.setState({isBluring: true});
    } else {
      op = 'minus';
      this.setState({isBluring: false});
    }
    window.requestAnimationFrame(animate);
    function animate(timestamp) {
      const actual = self.state.blurRadius;
      let blurRadius;
      switch (op) {
        case 'plus':
          if (self.state.isBluring && actual < expect) {
            self.setState({blurRadius: self.state.blurRadius + step});
            window.requestAnimationFrame(animate);
          } else {
            self.setState({isBluring: false});
          }
          break;
        case 'minus':
          if (!self.state.isBluring && actual >= 0) {
            self.setState({
              blurRadius: self.state.blurRadius - step,
              isBluring: false,
            });
            window.requestAnimationFrame(animate);
          }
          break;
      }
    }
  }
  
  onMouseOver(event) {
    this.blurOrClear.call(this, 15, 3);
  }
  
  onMouseLeave(event) {
    this.blurOrClear.call(this, 0, 5);
  }

  onClick(event) {
    if (typeof this.props.onClick === 'function') {
      this.props.onClick.call(this, event);
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
    let text = '点击上传图片';
    if (this.props.src && this.props.src.uri) {
      bg = <BlurView img={this.props.src.uri} blurRadius={this.state.blurRadius}></BlurView>;
      text = '点击更换图片';
    } else {
      className += ' image-cell-empty';
    }

    let fileInput = null;
    if (this.props.type === 'file') {
      fileInput = <input type="file" 
        multiple={this.props.multiple} onChange={this.onTypeFileSelect.bind(this)} />;
    }
    const hint = this.props.hint || text;
    return (
      <div className={className}
        onMouseOver={this.onMouseOver.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}>
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