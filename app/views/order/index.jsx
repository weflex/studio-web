import React from 'react';
import List from './list';
import Detail from './detail';

module.exports = class BookingView extends React.Component {
  constructor(props) {
    super(props);
  }

  get title() {
    return '订单管理';
  }

  get actions() {
    return [];
  }

  render() {
    const parsedResult = (window.location.pathname).substring(1).split('/');
    const bookingType = parsedResult[1];
    const bookingId = parsedResult[2];

    return (
      <div>
        {
          !bookingId
            ? <List bookingType={bookingType || 'order'} />
            : <Detail bookingType={bookingType} bookingId={bookingId} />
        }
      </div>
    );
  }
}
