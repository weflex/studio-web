import React from 'react';
import './switch-tab.css'

class SwitchTab extends React.Component {

  constructor (props) {
    super(props);
    const { options } = props;
    this.state = {
      selectedIndex: 0
    }
  }

  render () {
    return (
      <div className='switch-tab-wrapper'>
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
                    onClick={(e) => this.setState({selectedIndex: i})}>
                {op}
              </span>
            );
          })
        }
      </div>        
    );
  }
}

exports.SwitchTab = SwitchTab;
