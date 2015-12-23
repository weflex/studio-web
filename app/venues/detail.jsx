"use strict"

import React from 'react';
import { BaiduMap } from 'react-baidu-map';

export default class VenueDetail extends React.Component {
  constructor(props) {
    super(props);
    this.data = {
      // default value
      title: {
        en: null,
        zh: null
      },
      address: {
        en: null,
        zh: null
      },
      location: ''
    };
    this.styles = {
      form: {
        padding: 30
      },
      fieldset: {
        marginBottom: 10
      },
      title: {
        fontSize: 12
      },
      map: {
        height: 300
      }
    };
  }
  get actions() {
    return [
      {
        title: '创建工作室',
        onClick: () => {
          alert('success');
        }
      }
    ]
  }
  onAddressChange(event) {
    this.refs.location.search(event.target.value);
  }
  onLocationSelect(point) {
    // FIXME(Yorkie): use object when server compatible with
    this.data.location = point.lng + ',' + point.lat;
    console.log(this.data);
  }
  render() {
    return (
      <form style={this.styles.form}>
        <div style={this.styles.fieldset}>
          <h3 style={this.styles.title}>Venue Id</h3>
          <span>{this.data.id}</span>
        </div>
        <div style={this.styles.fieldset}>
          <h3 style={this.styles.title}>Title</h3>
          <div className="inline">
            <label>en*</label>
            <input type="text" value={this.data.title.en} required />
          </div>
          <div className="inline">
            <label>zh*</label>
            <input type="text" value={this.data.title.zh} required />
          </div>
        </div>
        <div style={this.styles.fieldset}>
          <h3 style={this.styles.title}>Notification</h3>
          <div className="inline">
            <label>Enable</label>
            <input type="text" value={this.data.smsEnabled} required />
          </div>
          <div className="inline">
            <label>Phone</label>
            <input type="text" value={this.data.phone} required />
          </div>
        </div>
        <div style={this.styles.fieldset}>
        </div>
        <div style={this.styles.fieldset}>
          <h3 style={this.styles.title}>Address</h3>
          <div className="inline">
            <label>en</label>
            <input type="text" value={this.data.address.en} />
          </div>
          <div className="inline">
            <label>zh</label>
            <input type="text" value={this.data.address.zh} onChange={this.onAddressChange.bind(this)} />
          </div>
          <div>
            <BaiduMap id="location" 
              ref="location" 
              style={this.styles.map}
              onSelect={this.onLocationSelect.bind(this)}
            />
          </div>
        </div>
      </form>
    )
  }
}