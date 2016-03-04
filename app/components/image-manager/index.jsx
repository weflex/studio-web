"use strict";

import React from 'react';
import ImageCell from '../image-cell';
import { TextButton } from '../form';
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
      uptoken: null
    };
  }

  async componentWillMount() {
    const venue = await client.org.getSelectedVenue();
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
    console.log(uptoken);
    this.setState({
      images,
      uptoken,
    });
  }

  async onFileDone(event) {
    const content = event.target.result;
    // console.log(token);
  }

  onSelectFiles(files) {
    let self = this;
    files.forEach(async (file) => {
      file.preview = 'image-manager';
      const r = await client.resource.upload(self.state.uptoken, file).end();
      console.log(r);
    });
  }

  render() {
    return (
      <div className="images-manager-container">
        <h3>{this.props.title}</h3>
        <section className="images-manager-body">
          {this.state.images.map((src, index) => {
            return (
              <ImageCell 
                key={index} 
                src={src}
                hint="点击选择"
                selectable={true}
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
          <TextButton text="确认选择" />
        </section>
      </div>
    );
  }

}

module.exports = ImageManager;