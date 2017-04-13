import React from 'react';
import List from './list';
import Detail from './detail';
import UIFramework from 'weflex-ui';
import AddBookingView from './add';

module.exports = class BookingView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddBooking : false,
    };

    this.hideViewAddBooking = this.hideViewAddBooking.bind(this);
  }

  get title() {
    return '订单管理';
  }

  get actions() {
    return [
      {
        title: '创建订单',
        onClick: this.showViewAddBooking.bind(this),
        disableToggled: true,
      }
    ];
  }

  showViewAddBooking() {
    this.setState({showAddBooking: true});
  }

  hideViewAddBooking() {
    this.setState({showAddBooking: false});
  }

  render() {
    const matchHrefResult = window.location.href
      .match(/\/order\?bookingType=(order|ptSession)\&bookingId=([0-9a-f]{24})$/);

    return (
      <div>
        <UIFramework.Modal
          title="添加新订单"
          footer=""
          visible={this.state.showAddBooking}
          onCancel={ () => this.setState({showAddBooking: false}) }>
          <AddBookingView onComplete={this.hideViewAddBooking}/>
        </UIFramework.Modal>
        {
          !matchHrefResult
            ? <List />
            : <Detail bookingType={matchHrefResult[1]} bookingId={matchHrefResult[2]} />
        }
      </div>
    );
  }
}
