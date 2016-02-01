"use strict";

import React from 'react';
import { BindingComponent } from 'react-binding-component';
import { client } from '../api';
import './form.css';
import './detail.css';

class TextInput extends BindingComponent {
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
          placeholder={this.props.placeholder}
          onChange={this.onChange.bind(this)}>
          {this.bindStateValue}
        </textarea>
      );
    } else {
      return (
        <input type="text"
          className={classNames.join(' ')}
          style={styles}
          value={this.bindStateValue}
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
        value={this.bindStateValue}
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
      accessType: null,
      lifetime: {
        value: null,
      }
    };
  }
  get title() {
    return '添加新会员卡';
  }
  get actions() {
    return [];
  }
  get disabled() {
    if (!this.state.name) {
      return true;
    }
    if (!this.state.lifetime.value) {
      return true;
    }
    if (!this.state.price) {
      return true;
    }
    return false;
  }
  async onsubmit(event) {
    try {
      await client.classPackage.create(this.state);
    } catch (err) {
      console.error(err && err.stack);
    }
  }
  form() {
    return [
      // name
      <div className="form-row">
        <Label required={true} text="名称" />
        <div className="form-row-controls">
          <TextInput 
            bindStateCtx={this} 
            bindStateName="name"
            bindStateType={String}
          />
        </div>
        <HintText text="请给您的卡取个简单易懂的名字" />
      </div>,
      // accessType
      <div className="form-row">
        <Label required={true} text="次数选择" />
        <div className="form-row-controls">
          <OptionsPicker
            bindStateCtx={this} 
            bindStateName="accessType"
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
          <TextInput 
            flex={0.5}
            bindStateCtx={this}
            bindStateType={Number}
            bindStateName="lifetime.value"
          />
          <OptionsPicker 
            flex={0.5}
            bindStateCtx={this}
            bindStateName="lifetime.scale"
            options={[
              {text: '天', value: 'day'},
              {text: '月', value: 'month'},
              {text: '年', value: 'year'},
            ]}
          />
        </div>
        <HintText text="设定该卡的有效期" />
      </div>,
      // price and price type
      <div className="form-row">
        <Label required={true} text="价格" />
        <div className="form-row-controls">
          <TextInput 
            bindStateCtx={this}
            bindStateType={Number} 
            bindStateName="price" 
          />
        </div>
        <HintText text="课程价格" />
      </div>,
      // delay
      <div className="form-row">
        <Label required={true} text="延期次数" />
        <div className="form-row-controls">
          <OptionsPicker 
            bindStateCtx={this}
            bindStateName="extensible"
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
        <Label required={false} text="描述" />
        <div className="form-row-controls">
          <TextInput 
            bindStateCtx={this}
            bindStateName="description"
            multiline={true} 
          />
        </div>
        <HintText text="您可以在这里添加更多关于该卡的信息" />
      </div>,
      // category
      <div className="form-row">
        <Label required={true} text="所属种类" />
        <div className="form-row-controls">
          <OptionsPicker 
            bindStateCtx={this}
            bindStateName="category"
            options={[
              {text: '年卡', value: '年卡'},
              {text: '次卡', value: '次卡'},
            ]}
          />
        </div>
        <HintText text="您可以为这张卡和其他您创建过的卡整理归类。只支持单选，可以删除预定义的类别" />
      </div>,
      // submit button
      <div classNames="form-row">
        <div classNames="form-row-controls">
          <TextButton text="确认添加" 
            onClick={this.onsubmit.bind(this)} 
            disabled={this.disabled}
          />
        </div>
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