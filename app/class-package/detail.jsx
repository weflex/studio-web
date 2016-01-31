"use strict";

import React from 'react';
import './form.css';
import './detail.css';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let classNames = ['form-input'];
    let styles = {
      width: 'calc(100% - 5px)'
    };
    if (this.props.flex) {
      styles.width = 'calc(' + (this.props.flex * 100) + '% - 5px)';
    }
    if (this.props.multiline) {
      classNames.push('form-input-multiline');
      // TODO(Yorkie): patch to react, className accepts array
      return (
        <textarea className={classNames.join(' ')} 
          style={styles}
          placeholder={this.props.placeholder}>
        </textarea>
      );
    } else {
      return (
        <input type="text"
          className={classNames.join(' ')}
          style={styles}
          placeholder={this.props.placeholder}
        />
      );
    }
  }
}

class OptionsPicker extends React.Component {
  constructor(props) {
    super(props);
  }
  onChange(event) {
    if (this.props.stateCtx
      && this.props.stateName) {
      this.props.stateCtx.setState({
        [this.props.stateName]: event.target.value
      })
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
      <label className={className}>
        <span className="label-text">{this.props.text}</span>
      </label>
    );
  }
}

class HintText extends React.Component {
  render() {
    return (
      <div className="form-row-hint">
        {this.props.text.split('\\n').map((line, index) => {
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  }
}

class PriceControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 1,
      prices: []
    };
  }
  render() {
    return (
      <div className="price-control">
        <div className="price-select">
          <OptionsPicker
            stateCtx={this}
            stateName="type"
            options={[
              {text: '1种价格', value: 1},
              {text: '2种价格', value: 2},
            ]}
          />
        </div>
        <ul className="price-prices">
          {_.range(1, Number(this.state.type) + 1).map((item, index) => {
            return (
              <li key={index}>
                <TextInput flex={0.7} placeholder="价格名称" />
                <TextInput flex={0.3} placeholder="价格" />
              </li>
            );
          })}
        </ul>
      </div>
    )
  }
}

class CardDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      accessType: null
    };
  }

  get title() {
    return '添加新会员卡';
  }

  get actions() {
    return [];
  }
  form() {
    return [
      // name
      <div className="form-row">
        <Label required={true} text="名称" />
        <div className="form-row-controls">
          <TextInput data={this.state.name} />
        </div>
        <HintText text="请给您的卡取个简单易懂的名字" />
      </div>,
      // accessType
      <div className="form-row">
        <Label required={true} text="次数选择" />
        <div className="form-row-controls">
          <OptionsPicker
            data={this.state.accessType}
            options={[
              {text: '多次卡', value: 'multiple'},
              {text: '无限次', value: 'unlimited'}
            ]} 
          />
        </div>
        <HintText text="设定该健身卡属于一次性，多次，无限次卡" />
      </div>,
      // expiredDate
      <div className="form-row">
        <Label required={true} text="有效期" />
        <div className="form-row-controls">
          <TextInput flex={0.5} />
          <OptionsPicker 
            flex={0.5}
            data={this.state.lifetime}
            options={[
              {text: '天', value: 'day'},
              {text: '周', value: 'week'},
              {text: '月', value: 'month'}
            ]}
          />
        </div>
        <HintText text="设定该卡的有效期" />
      </div>,
      // price and price type
      <div className="form-row">
        <Label required={true} text="价格类别" />
        <div className="form-row-controls">
          <PriceControl />
        </div>
        <HintText text="如果针对不同类型的客人有不同价格，可以在这里选择\n\n描述客人类型（比如会员，非会员）和价格" />
      </div>,
      // delay
      <div className="form-row">
        <Label required={true} text="延期次数" />
        <div className="form-row-controls">
          <OptionsPicker 
            options={[
              {text: '不能延期', value: 0},
              {text: '可1次', value: 1},
              {text: '可2次', value: 2},
              {text: '可3次', value: 3},
              {text: '可4次', value: 4},
            ]}
          />
        </div>
        <HintText text="您的会员可能因为各种情况需要延长卡的有效期，您可以在这里设置延长次数" />
      </div>,
      // description
      <div className="form-row">
        <Label required={true} text="描述" />
        <div className="form-row-controls">
          <TextInput multiline={true} />
        </div>
        <HintText text="您可以在这里添加更多关于该卡的信息" />
      </div>,
      // category
      <div className="form-row">
        <Label required={true} text="所属种类" />
        <div className="form-row-controls">
          <OptionsPicker 
            options={[
              {text: '年卡', value: '年卡'},
              {text: '次卡', value: '次卡'},
            ]}
          />
        </div>
        <HintText text="您可以为这张卡和其他您创建过的卡整理归类。只支持单选，可以删除预定义的类别" />
      </div>
    ];
  }
  render() {
    return (
      <div className="class-package-detail-container">
        <div className="class-package-detail-form form">
          {this.form()}
        </div>
        <div className="class-package-detail-preview">

        </div>
      </div>
    );
  }
}

module.exports = CardDetail;