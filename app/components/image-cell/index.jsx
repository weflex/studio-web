import React from 'react';
import './index.css';

class ImageCell extends React.Component {
  static propTypes = {
    src: React.PropTypes.object,
    description: React.PropTypes.string,
    onClick: React.PropTypes.func,
    hint: React.PropTypes.string,
    selected: React.PropTypes.bool,
    selectable: React.PropTypes.bool,
    onFilesSelect: React.PropTypes.func,
    multiple: React.PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      isSelected: props.selected || false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ isSelected: nextProps.selected || false });
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

  checkFile(file, index) {
    const imageType = new Set(['image/png', 'image/jpg', 'image/jpeg', 'image/gif']);
    if ( !imageType.has(file.type) ) {
      return `文件(${file.name})不是图片格式：.png, .jpg, .jpeg, .gif。`;
    } else if (file.size > 2*1024*1024) {
      return `文件(${file.name})大小必须小于2M。`;
    }
    return null;
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

    let errors = [];
    let returns = [];
    for (let i = 0; i < files.length; i++) {
      let usable = this.checkFile(files[i], i);
      usable? errors.push(usable): returns.push(files[i]);
    }

    if (errors.length > 0) {
      return window.alert( errors.concat('\n') );
    } else {
      if (typeof this.props.onFilesSelect !== 'function') {
        console.warn('initialize ImageCell with file type, but onFilesSelect prop not found');
      } else {
        this.props.onFilesSelect(returns);
      }
    }
  }

  render() {
    let className = 'image-cell';
    let bg = null;
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
      fileInput = <input type="file" multiple={this.props.multiple} onChange={this.onTypeFileSelect.bind(this)} />;
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

