"use strict";

import React from 'react';
import { UIButton } from 'react-ui-form';
import ImageCell from '../image-cell';
import random from '@weflex/random';
import { client } from '../../api';
import './index.css';

class ImageManager extends React.Component {

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
    this.cells = [];
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
    this.cells = [];
    this.setState({
      images
    });
  }

  async onSelectFiles(files) {
    let self = this;
    const venue = await client.user.getVenueById();
    try {
      await Promise.all(files.map((file) => {
        file.preview = [venue.id, random.strings(32)].join('-');
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
      this.cells.push(cell);
    }
  }

  onSelectResource(event, resource) {
    if (this.state.mode === 'single') {
      this.cells.forEach((cell) => {
        cell.setState({ 
          isSelected: resource.id === cell.props.src.id 
        });
      });
      // TODO(Yorkie): directly choose?
      // this.onSubmit();
    }
  }

  onSubmit() {
    const srcs = this.cells.filter((cell) => {
      return cell.state.isSelected;
    }).map((cell) => {
      return cell.props.src;
    });
    if (typeof this.props.onFinish !== 'function') {
      console.warn('miss onFinish on initializing component');
    } else {
      this.props.onFinish(srcs);
    }
  }

  render() {
    return (
      <div className="images-manager-container">
        <h3>{this.props.title}</h3>
        <section className="images-manager-body">
          {this.state.images.map((src, index) => {
            let data = this.props.data || [];
            if (data && !Array.isArray(this.props.data)) {
              data = [data];
            }
            const selected = !!_.find(data, (item) => {
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
          <UIButton text="确认选择" onClick={this.onSubmit.bind(this)} />
        </section>
      </div>
    );
  }

}

module.exports = ImageManager;