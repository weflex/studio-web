'use strict';
const React = require('react');

class ClassView extends React.Component {
  constructor(props) {
    super(props);
    this.data = {};
  }
  render() {
    return (
      <form className="edit-class">
        <fieldset className="item">
          <h3>Class Id</h3>
          <span>{this.data.id}</span>
        </fieldset>
        <fieldset className="item">
          <h3>Is Template</h3>
          <span>{this.data.isTemplate}</span>
        </fieldset>
        <fieldset className="item">
          <h3>Title</h3>
          <div className="inline">
            <label>en*</label>
            <input type="text" value={this.data.title.en} required />
          </div>
          <div className="inline">
            <label>zh*</label>
            <input type="text" value={this.data.title.zh} required />
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>Available</h3>
          <div className="inline">
            <input type="checkbox" value={this.data.available} />
            <label>Available</label>
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>Type</h3>
          <div className="inline">
            <input type="checkbox" value={this.data.properties.isPTrainer} />
            <label>Private Trainer</label>
          </div>
          <div className="inline">
            <input type="checkbox" value={this.data.properties.isForLadies} />
            <label>Lady Only</label>
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>Category*</h3>
          <div className="inline">
            <label>category*</label>
            <input type="text" value={this.data.category} required />
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>Pricing</h3>
          <div className="inline">
            <label>Price*</label>
            <input type="text" value={this.data.price} required />
          </div>
          <div className="inline">
            <label>Original Price*</label>
            <input type="text" value={this.data.originalPrice} required />
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>How the class works</h3>
          <textarea></textarea>
        </fieldset>
        <fieldset className="item">
          <h3>Date Time</h3>
          <div className="inline">
            <label>Date*</label>
            <input type="date" value={this.data.date} />
          </div>
          <div className="inline">
            <label>Start*</label>
            <input type="time" value={this.data.from} />
          </div>
          <div className="inline">
            <label>End*</label>
            <input type="time" value={this.data.to} />
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>Class Spots</h3>
          <div className="inline">
            <label>Total*</label>
            <input type="text" value={this.data.spots.total} />
          </div>
          <div className="inline">
            <label>Available*</label>
            <input type="text" value={this.data.spots.available} />
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>Thumbnail</h3>
          <div className="inline">
            <label>Image URI</label>
            <input type="text" value={this.data.thumbnail} />
          </div>
        </fieldset>
        <fieldset className="item">
          <h3>Photos</h3>
          <div className="inline">
            <label>Photo URI</label>
            <input type="text" />
          </div>
        </fieldset>
      </form>
    );
  }
}
