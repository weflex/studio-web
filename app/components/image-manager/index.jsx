"use strict";

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import ImageCell from '../image-cell';
import randomize from 'randomatic';
import { client } from '../../api';
import { filter, find } from 'lodash';
import './index.css';

class ImageManager extends React.Component {
  static propTypes = {
    src: React.PropTypes.object,
    data: React.PropTypes.any,
    mode: React.PropTypes.string,
    size: React.PropTypes.number,
    onFinish: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      /**
       * @state {Array} images - the image array
       */
      images: [],
      /**
       * @state {String} mode - the mode to submit
       */
      mode: this.props.mode || 'multiple',
      /**
       * @state {String} uptoken - the uptoken is for uploading
       */
      uptoken: null,
    };
    this.cells = {};
  }

  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const [ 
      images,
      {
        uptoken
      }
    ] = await Promise.all([
      client.externalResource.list({
        where: { venueId: venue.id }
      }),
      client.resource.token(venue.id),
    ]);
    this.setState({
      images,
      uptoken,
    });
  }

  async refresh() {
    const venue = await client.user.getVenueById();
    const images = await client.externalResource.list({
      where: {
        venueId: venue.id,
      },
    });
    this.cells = {};
    this.setState({
      images
    });
  }

  async onSelectFiles(files) {
    let self = this;
    const venue = await client.user.getVenueById();
    try {
      await Promise.all(files.map((file) => {
        file.preview = [venue.id, randomize('Aa0', 32)].join('-');
        return client.resource.upload(self.state.uptoken, file).end();
      }));
      await this.refresh();
    } catch (err) {
      console.error(err);
      alert(err && err.message);
    }
  }

  onRefImageCell(cell) {
    if (cell) {
      this.cells[cell.props.src.id] = cell;
    }
  }

  onSelectResource(event, resource) {
    if (this.props.mode === 'single') {
      for (let index in this.cells) {
        this.cells[index].setState({
          isSelected: resource.id === this.cells[index].props.src.id 
        });
      }
      // TODO(Yorkie): directly choose?
      // this.onSubmit();
    }
  }

  onSubmit() {
    const { mode } = this.props;
    const selectedNumber = filter(this.cells || [], ['state.isSelected', true]);

    if (mode === 'single' && selectedNumber.length !== 1) {
      return UIFramework.Message.error('至少选择一张图片。');
    } else if(mode === 'multiple' && this.props.size > 0 && this.props.size < selectedNumber.length ) {
      return UIFramework.Message.error(`课程图片数量不得大于${this.props.size}。`);
    } else {
      const srcs = selectedNumber.map(item => item.props.src);
      if (typeof this.props.onFinish !== 'function') {
        console.warn('miss onFinish on initializing component');
      } else {
        this.props.onFinish(srcs);
      }
    }
  }

  render() {
    return (
      <div className="images-manager-container">
        <section className="images-manager-body">
          {this.state.images.map((src, index) => {
            let data = this.props.data || [];
            if (data && !Array.isArray(this.props.data)) {
              data = [data];
            }
            const selected = !!find(data, (item) => {
              return item.id === src.id;
            });
            return (
              <ImageCell
                ref={this.onRefImageCell.bind(this)}
                key={index} 
                src={src}
                hint="点击选择"
                selectable={true}
                selected={selected}
                onClick={this.onSelectResource.bind(this)}
              />
            );
          })}
          <ImageCell
            type="file"
            multiple={this.props.mode === 'multiple'}
            onFilesSelect={this.onSelectFiles.bind(this)}
          />
        </section>
        <section className="images-manager-footer">
          <UIFramework.Button text="确认选择" onClick={this.onSubmit.bind(this)} />
        </section>
      </div>
    );
  }
}

module.exports = ImageManager;
