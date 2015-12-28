"use strict";

const React = require('react');
const GridList = require('material-ui/lib/grid-list/grid-list');
const GridTile = require('material-ui/lib/grid-list/grid-tile');
const SelectField = require('material-ui/lib/select-field');
const MenuItem = require('material-ui/lib/menus/menu-item');
const { Popover } = require('material-ui');

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
  get actions() {
    return [
      {
        title: '创建新卡',
        path: '/card/add'
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
        <div style={this.styles.header}>
          <h1 style={this.styles.title}>卡种分类</h1>
        </div>
        <div style={this.styles.toolbar}>
          <SelectField style={this.styles.orderBy}>
            <MenuItem key={0} primaryText="按类型排序" />
            <MenuItem key={1} primaryText="按时间排序" />
            <MenuItem key={2} primaryText="按名称排序" />
          </SelectField>
        </div>
        <div style={this.styles.contents}>
          <h3 style={this.styles.subtitle}>8人以下的团课</h3>
          <GridList cellHeight={180} cols={5}>
            <GridTile title="首次体验课"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
            <GridTile title="单次课程"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
            <GridTile title="5次套餐"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
            <GridTile title="10次套餐"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
            <GridTile title="首次体验课"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
          </GridList>
          <h3 style={this.styles.subtitle}>私教80分钟</h3>
          <GridList cellHeight={200} cols={5}>
            <GridTile title="单次课程－教练1"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
            <GridTile title="单次课程－教练2"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
            <GridTile title="单次课程－教练3"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
          </GridList>
          <h3 style={this.styles.subtitle}>无限次卡</h3>
          <GridList cellHeight={200} cols={5}>
            <GridTile title="一个月无限次卡"
              subtitle="普通价：300元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
            <GridTile title="六个月无限次卡"
              subtitle="普通价：7200元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
          </GridList>
          <h3 style={this.styles.subtitle}>SMF会员</h3>
          <GridList cellHeight={200} cols={5}>
            <GridTile title="会员卡"
              subtitle="单价：1200元">
              <img src="http://www.material-ui.com/images/grid-list/morning-819362_640.jpg" />
            </GridTile>
          </GridList>
        </div>
        <Popover open={this.state.activePopover === 'pop'}
          anchorEl={this.state.anchorEl}>
          <div style={{padding: 20}}>
            <h2>Here is an arbitrary popover</h2>
            <p>Hi - here is some content</p>
          </div>
        </Popover>
      </div>
    );
  }
}

module.exports = CardList;