"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import stackBlurImage from './stack-blur.js';
import './index.css';

/**
 * A component for blur view
 * Example:
 *
 *  <BlurView img="https://host/path/to/your/assets/foo.jpg" blurRadius={10}>
 *    Text or Children
 *  </BlurView>
 *
 * @class BlurView
 */

export class BlurView extends React.Component {
  static propTypes = {
    /**
     * @property {String} img - img url
     * @required
     */
    img: React.PropTypes.string.isRequired,
    /**
     * @property {Number} blurRadius - blur radius
     */
    blurRadius: React.PropTypes.number,
    /**
     * @property {Number} resizeInterval - the interval number of reszing image
     */
    resizeInterval: React.PropTypes.number,
    /**
     * @property {String} className - the class name of this container div
     */
    className: React.PropTypes.string,
    /**
     * @property {any} children - the children elements
     */
    children: React.PropTypes.any,
  };

  static defaultProps = {
    blurRadius: 0,
    resizeInterval: 128,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    const {blurRadius} = this.props;
    const container = ReactDOM.findDOMNode(this);

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    this.canvas = ReactDOM.findDOMNode(this.refs.canvas);
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.img = new Image();
    this.img.crossOrigin = 'Anonymous';
    this.img.onload = () => {
      stackBlurImage(this.img, this.canvas, blurRadius, this.width, this.height);
    };
    this.img.src = this.props.img;

    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize() {
    const now = new Date().getTime();
    let deferTimer = 0;
    const threshhold = this.props.resizeInterval;

    if (this.last && now < this.last + threshhold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        this.last = now;
        this.doResize();
      }, threshhold);
    } else {
      this.last = now;
      this.doResize();
    }
  }

  doResize() {
    const container = ReactDOM.findDOMNode(this);

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    stackBlurImage(this.img, this.canvas, this.props.blurRadius, this.width, this.height);
  }

  componentWillUpdate(nextProps) {
    if (this.img.src !== nextProps.img) {
      this.img.src = nextProps.img;
    }
    stackBlurImage(this.img, this.canvas, nextProps.blurRadius, this.width, this.height);
  }

  render() {
    const {img, className, children, ...other} = this.props;
    let classes = 'react-blur';

    if (className) {
      classes += ' ' + className;
    }

    return (
      <div {...other} className={classes} onClick={this.clickTest} >
        <canvas className='react-blur-canvas' ref='canvas' />
        {children}
      </div>
    );
  }
}
