"use strict";

/**
 * @module react-profile
 */

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
const DEFAULT_AVATAR = 'http://static.theweflex.com/default-avatar-male.png';

/**
 * @class AvatarImage
 */
class UIAvatarImage extends React.Component {
  static propTypes = {
    /**
     * @property {weflex.ExternalResource} src - the src with uri
     */
    src: React.PropTypes.object,
    /**
     * @property {Number} size - the size
     */
    size: React.PropTypes.number,
    /**
     * @property {String} className - the class name of the <img>
     */
    className: React.PropTypes.string,
  };
  static defaultProps = {
    src: {
      uri: DEFAULT_AVATAR,
    },
    size: 40,
    className: '',
  };
  render() {
    let uri;
    if (!this.props.src || !this.props.src.uri) {
      uri = DEFAULT_AVATAR;
    } else {
      uri = this.props.src.uri;
    }
    const imgStyl = {
      width: this.props.size,
      height: this.props.size,
      borderRadius: this.props.size / 2,
    };
    return (
      <img 
        className={this.props.className}
        style={imgStyl} 
        src={uri} 
      />
    );
  }
}

/**
 * @class ProfileListItem
 */
class UIProfileListItem extends React.Component {
  static propTypes = {
    /**
     * @property {weflex.ExternalResource} avatar - the avatar
     */
    avatar: React.PropTypes.object,
    /**
     * @property {String} header - the header content
     */
    header: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.node,
    ]),
    /**
     * @property {String} labelText - the text is in bottom of avatar
     */
    labelText: React.PropTypes.string,
    /**
     * @property {String} className - the class name of the <img>
     */
    className: React.PropTypes.string,
    /**
     * @property {String} children - the section content
     */
    children: React.PropTypes.node,
  };
  static defaultProps = {
    header: 'header',
    labelText: null,
    avatar: null,
    children: null,
  };
  static styles = {
    profile: {
      boxSizing: 'border-box',
    },
    left: {
      display: 'inline-block',
      width: 55,
    },
    right: {
      display: 'inline-block',
      width: 'calc(100% - 55px)',
    },
  };
  render() {
    return (
      <div style={UIProfileListItem.styles.profile} 
        className={this.props.className}>
        <div style={UIProfileListItem.styles.left}>
          <UIFramework.Image 
            src={this.props.avatar} 
            circle={true} 
            style={{}} 
          />
          <div style={UIProfileListItem.styles.label}>
            {this.props.labelText}
          </div>
        </div>
        <div style={UIProfileListItem.styles.right}>
          <header>{this.props.header}</header>
          <section>
            {this.props.children}
          </section>
        </div>
      </div>
    );
  }
}

module.exports = {
  UIAvatarImage,
  UIProfileListItem,
};
