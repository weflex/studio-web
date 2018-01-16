// This component handles the App template used on every page.
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import '../../styles/root.css';
import '../../styles/keyframes.css';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired
};

function mapStateToProps(state){
  return {
    loading: state.ajaxCallsInProgress > 0,
  };
}

export default connect(
  mapStateToProps,
  null
)(App);
