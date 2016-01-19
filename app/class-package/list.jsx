"use strict";

const React = require('react');
// const GridList = require('material-ui/lib/grid-list/grid-list');
// const GridTile = require('material-ui/lib/grid-list/grid-tile');
// const SelectField = require('material-ui/lib/select-field');
// const MenuItem = require('material-ui/lib/menus/menu-item');
// const { Popover } = require('material-ui');

class CardList extends React.Component {
  constructor(props) {
    super(props);
    this.styles = {
      header: {
        padding: 10,
        textAlign: 'center',
        backgroundColor: '#f3f3f3'
      },
      title: {
        fontSize: 18,
      },
      toolbar: {
        position: 'relative',
      },
      orderBy: {
        position: 'absolute',
        right: 30
      },
      contents: {
        padding: '0 30px',
      },
      subtitle: {
        fontSize: 14,
        fontWeight: 'normal',
        margin: '20px 0',
      }
    };
    this.state = {
      activePopover: 'none',
      anchorEl: null,
    };
  }
  get title() {
    return '卡种管理'
  }
  get actions() {
    return [
      {
        title: '创建新卡',
        path: '/class/package/add'
      }
    ];
  }
  showPopover(e) {
    this.setState({
      activePopover: 'pop',
      anchorEl: e.currentTarget,
    });
  }
  render() {
    return (
      <div style={this.styles.container}>
      </div>
    );
  }
}

module.exports = CardList;