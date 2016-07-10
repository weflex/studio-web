import React from 'react';
import './switch-tab.css'

class SwitchTab extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      selectedIndex: 0
    }
  }

  setSelectedIndex(selectedIndex) {
    const { events, onSwitch} = this.props;
    onSwitch(events[selectedIndex]);
    this.setState({ selectedIndex });
  }

  render () {
    return (
      <span className='switch-tab-wrapper'>
        {
          this.props.options.map((op, i) => {
            const style = {
              width: 100 / this.props.options.length + '%'
            };
            if (i === this.state.selectedIndex) {
              style.color = 'white';
              style.background = '#00e4ff';
            }
            return (
              <span className='switch-tab-option'
                    key={i}
                    style={style}
                    onClick={(e) => this.setSelectedIndex(i)}>
                {op}
              </span>
            );
          })
        }
      </span>
    );
  }
}

SwitchTab.propTypes = {
  options: React.PropTypes.array,
  events: React.PropTypes.array,
  onSwitch: React.PropTypes.func
};

exports.SwitchTab = SwitchTab;
