import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UIFramework from '@weflex/weflex-ui';
import List from './list';
import AddBookingView from './add';
import { FormattedMessage } from 'react-intl';

class BookingView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisibled: false,
    }

    this.onViewAddOrder = this.onViewAddOrder.bind(this);
  }

  get title() {
    return <FormattedMessage id='studio_web_booking_page_title'/>;
  }

  get actions() {
    const { intl } = this.props;
    return [
      {
        title: <FormattedMessage id='studio_web_booking_actions_create_order'/>,
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
    const { intl } = this.props;
    const bookingType = (window.location.pathname).substring(1).split('/')[1] || 'order';
    return (
      <div>
        <div>
          <List bookingType={bookingType} />
        </div>
        <UIFramework.Modal
            title={<FormattedMessage id="studio_web_booking_modal_add_new_order"/>}
            footer=""
            visible={this.state.modalVisibled}
            onCancel={() => this.setState({modalVisibled: false})}
        >
          <AddBookingView onComplete={() => this.setState({modalVisibled: false})} />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = BookingView;
