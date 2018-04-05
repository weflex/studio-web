import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import List from './list';
import AddBookingView from './add';

class BookingView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisibled: false,
    }

    this.onViewAddOrder = this.onViewAddOrder.bind(this);
  }

  get title() {
    return '订单管理';
  }

  get actions() {
    return [
      {
        title: '创建订单',
        onClick: this.onViewAddOrder,
        disableToggled: true,
      }
    ];
  }

  onViewAddOrder() {
    mixpanel.track( "订单：订单创建");
    this.setState({ modalVisibled: true });
  }

  render() {
    const bookingType = (window.location.pathname).substring(1).split('/')[1] || 'order';
    return (
      <div>
        <div>
          <List bookingType={bookingType} />
        </div>
        <UIFramework.Modal
            title="添加新订单"
            footer=""
            visible={this.state.modalVisibled}
            onCancel={() => this.setState({modalVisibled: false})}
        >
         {this.state.modalVisibled ?<AddBookingView onComplete={() => this.setState({modalVisibled: false})} />:''} 
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = BookingView;
