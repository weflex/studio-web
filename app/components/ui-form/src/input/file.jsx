"use strict";

import React from 'react';
import { BindingComponent } from 'react-binding-component';
import { UIRow } from '../base';
import UITextInput from './text';
import UIButton from '../button/base';

/**
 * @class UIFileInput
 * @extend BindingComponent
 */
class UIFileInput extends BindingComponent {

  static styles = {
    container: {
      position: 'relative',
    },
    fileInput: {
      position: 'absolute',
      width: '100%',
      height: '30px',
      top: '0',
      left: '0',
      opacity: '0',
      cursor: 'pointer',
      zIndex: '90',
    },
    preview: {
      overflowX: 'scroll',
      marginTop: '10px',
    },
    cellInPreview: {
      position: 'relative',
      display: 'inline-block',
      margin: '0px 2px',
      border: '1px solid #ebebeb',
      borderRadius: '3px',
      boxSizing: 'border-box',
      // for non-multiple
      width: 'calc(100% - 5px)',
      height: '100px',
    },
    multipleCell: {
      width: 'calc(33% - 5px)',
      height: '110px',
    },
  };

  /**
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      dataUrls: []
    };
  }

  /**
   * @event onFileUpload
   */
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

  /**
   * @event onFileFinished
   */
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

  /**
   * @method preview
   */
  preview() {
    if (!this.state.dataUrls.length) {
      return null;
    }
    let cellStyl = Object.assign({}, UIFileInput.styles.cellInPreview);
    if (this.props.multiple) {
      cellStyl = Object.assign(cellStyl, UIFileInput.styles.multipleCell);
    }
    return (
      <ul style={UIFileInput.styles.preview}>
        {this.state.dataUrls.map((content, index) => {
          const onClose = () => {
            const dataUrls = this.state.dataUrls.filter((content, index_) => {
              return index !== index_;
            });
            this.setState({dataUrls});
          };
          return (
            <li key={index} style={cellStyl}>
              <div onClick={onClose}></div>
              <img src={content} />
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    return (
      <div style={UIFileInput.styles.container}>
        <UIRow>
          <UITextInput flex={0.8}
            bindstateCtx={this}
            bindStateName="value"
            bindStateValue={this.state.value}
            placeholder={this.props.placeholder}
          />
          <UIButton flex={0.2} text="上传" />
        </UIRow>
        <input
          style={UIFileInput.styles.fileInput}
          type="file"
          value={this.props.bindStateValue}
          onChange={this.onFileUpload.bind(this)}
        />
        {this.preview()}
      </div>
    );
  }
}

module.exports = UIFileInput;