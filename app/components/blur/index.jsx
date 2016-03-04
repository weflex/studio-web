"use strict";

const React = require('react');
const ReactDOM = require('react-dom');
const PureRenderMixin = require('react-addons-pure-render-mixin');
const stackBlurImage = require('./stack-blur.js');
require('./index.css');

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
var BlurView = React.createClass({
  mixins: [
    PureRenderMixin
  ],
  
  propTypes: {
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
    children: React.PropTypes.any
  },

  getDefaultProps() {
    return {
      blurRadius: 0,
      resizeInterval: 128
    };
  },

  componentDidMount() {
    var {blurRadius} = this.props;
    var container = ReactDOM.findDOMNode(this);

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    console.log(this.container);

    this.canvas = ReactDOM.findDOMNode(this.refs.canvas);
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.img = new Image();
    this.img.crossOrigin = 'Anonymous';
    this.img.onload = () => {
      stackBlurImage( this.img, this.canvas, blurRadius, this.width, this.height);
    };
    this.img.src = this.props.img;

    window.addEventListener('resize', this.resize);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  },

  resize() {
    var now = new Date().getTime();
    var deferTimer;
    var threshhold = this.props.resizeInterval;

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
  },

  doResize() {
    var container = ReactDOM.findDOMNode(this);

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    stackBlurImage(this.img, this.canvas, this.props.blurRadius, this.width, this.height);
  },

  componentWillUpdate(nextProps) {
    if (this.img.src !== nextProps.img) {
      this.img.src = nextProps.img;
    }
    stackBlurImage(this.img, this.canvas, nextProps.blurRadius, this.width, this.height);
  },

  render() {
    var {img, className, children, ...other} = this.props;
    var classes = 'react-blur';

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
});

exports.BlurView = BlurView;