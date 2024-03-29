import './index.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Location, Locations, Link } from 'react-router-component';

class ListItem extends Component {

  constructor(props) {
    super(props);
  }

  render () {
    const { avatar, title, label, description } = this.props;

    return (
      <div className="list-item">
        <div className="avatar">
          {
            avatar
            ? <img src={avatar} />
            : <span>{title}</span>
          }
        </div>
        <div className="description">
          <p>
            <span>{title}</span>
            <span>{label}</span>
          </p>
          <p> {description}</p>
        </div>
      </div>
    );
  }
}

class ListDetail extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dataIndex: 0,
    }

    this.renderDetail = this.renderDetail.bind(this);
  }

  renderList () {
    const { data, sortBy, sortList, onSortChange, isEnd, onLoadMore } = this.props;
    const { dataIndex } = this.state;

    return (
      <div className="list">
        <div className="list-sort">
          <select onChange={onSortChange}>
            {
              sortList.map((item, index) => <option key={index} value={item.value} selected={item.value === sortBy? 'selected': ''}>{item.text}</option>)
            }
          </select>
        </div>
        <ul className="list-iterator">
          {
            data.map((item, index) => {
              return (
                <li key={index} className={index === dataIndex? 'active': ''} onClick={() => this.setState({dataIndex: index})}>
                  <a>
                    <ListItem avatar={item.avatarURL} title={item.title} label={item.label} description={item.description} />
                  </a>
                </li>
              );
            })
          }
          <li className="list-item list-item-add">
            {
              isEnd
                ? <span>已全部加载完毕</span>
                : <a onClick={onLoadMore}>加载更多...</a>
            }
          </li>
        </ul>
      </div>
    );
  }

  renderDetail() {
    const { data, detailComponent, onRefresh } = this.props;
    const { dataIndex } = this.state;

    return (
      <section className="detail-container">
        {
          data[dataIndex]
            ? React.createElement(detailComponent,
            {
              data: (data || [])[dataIndex],
              onRefresh,
            })
            : ''
        }
      </section>
    );
  }

  render() {
    return (
      <div className="list-detail">
        {this.renderList()}
        <div className="detail">
          {this.renderDetail()}
        </div>
      </div>
    );
  }

}

ListDetail.propTypes = {
  data: PropTypes.array,
  sortBy: PropTypes.string,
  sortList: PropTypes.array,
  detailComponent: PropTypes.Component,
  onSortChange: PropTypes.func,
  isEnd: PropTypes.bool,
  onLoadMore: PropTypes.func,
  onRefresh: PropTypes.func,
}

export default ListDetail;
