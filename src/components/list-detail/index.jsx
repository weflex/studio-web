import './index.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

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
    const { intl } = this.props;

    return (
      <div className="list">
        <div className="list-sort">
          <select onChange={onSortChange}>
            {
              sortList.map((item, index) => <option key={index} value={item.value}>{item.text}</option>)
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
                ? <span>{intl.formatMessage({id: 'studio_web_list_detail_end_of_list'})}</span>
                : <a onClick={onLoadMore}>{intl.formatMessage({id: 'studio_web_list_detail_load_more'})}</a>
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
  detailComponent: PropTypes.func,
  onSortChange: PropTypes.func,
  isEnd: PropTypes.bool,
  onLoadMore: PropTypes.func,
  onRefresh: PropTypes.func,
  intl: intlShape.isRequired,
}

export default injectIntl(ListDetail);
