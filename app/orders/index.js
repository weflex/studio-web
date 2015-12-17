'use strict';
const React = require('react');
const Moment = require('moment');
const { 
  Table, 
  Column, 
  Cell 
} = require('fixed-data-table');
const Order = require('../api/order');

var SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function reverseSortDirection (sortDir) {
  return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
}

function getValueByNamespace (obj, namespace, isDate) {
  var curr = obj;
  var names = namespace.split('.');
  var key;
  do {
    key = names.shift();
    if (key) {
      curr = curr[key];
    }
  } 
  while (key && curr);
  if (isDate) {
    return Moment(curr).calendar();
  } else {
    return curr;
  }
}

class SortHeaderCell extends React.Component {
  constructor(props) {
    super(props);
    this._onSortChange = this._onSortChange.bind(this);
  }
  render() {
    var {sortDir, children, ...props} = this.props;
    return (
      <Cell {...props}>
        <a onClick={this._onSortChange}>
          {children} {sortDir ? (sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
        </a>
      </Cell>
    );
  }
  _onSortChange(e) {
    e.preventDefault();
    if (this.props.onSortChange) {
      this.props.onSortChange(
        this.props.columnKey,
        this.props.sortDir ?
          reverseSortDirection(this.props.sortDir) :
          SortTypes.DESC
      );
    }
  }
}

const TextCell = ({rowIndex, data, columnKey, isDate, ...props}) => (
  <Cell {...props}>
    {getValueByNamespace(
      data.getObjectAt(rowIndex),
      columnKey,
      isDate
    )}
  </Cell>
);

class DataListWrapper {
  constructor(indexMap, data) {
    this._indexMap = indexMap;
    this._data = data;
  }
  getSize() {
    return this._indexMap.length;
  }
  getObjectAt(index) {
    return this._data[
      this._indexMap[index]
    ];
  }
}

class Orders extends React.Component {
  constructor(props) {
    super(props);
    this._dataList = [];
    this._defaultSortIndexes = [];
    this.state = {
      sortedDataList: new DataListWrapper([], []),
      colSortDirs: {},
    };
    this._onSortChange = this._onSortChange.bind(this);
  }
  async componentDidMount() {
    this._dataList = await Order.list();
    this._index.call(this);
    this.setState({
      sortedDataList: new DataListWrapper(this._defaultSortIndexes, this._dataList)
    });
  }
  _index() {
    var size = this._dataList.length;
    for (let index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }
  }
  _onSortChange(columnKey, sortDir) {
    var sortIndexes = this._defaultSortIndexes.slice();
    sortIndexes.sort((indexA, indexB) => {
      var valueA = getValueByNamespace(this._dataList[indexA], columnKey);
      var valueB = getValueByNamespace(this._dataList[indexB], columnKey);
      var sortVal = 0;
      if (valueA > valueB) {
        sortVal = 1;
      }
      if (valueA < valueB) {
        sortVal = -1;
      }
      if (sortVal !== 0 && sortDir === SortTypes.ASC) {
        sortVal = sortVal * -1;
      }
      return sortVal;
    });
    this.setState({
      sortedDataList: new DataListWrapper(sortIndexes, this._dataList),
      colSortDirs: {
        [columnKey]: sortDir,
      },
    });
  }
  render() {
    var {sortedDataList, colSortDirs} = this.state;
    return (
      <Table
        rowHeight={50}
        rowsCount={sortedDataList.getSize()}
        headerHeight={50}
        width={1450}
        height={1000}
        {...this.props}>
        <Column
          columnKey="prod.venue.name.en"
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs['prod.venue.name.en']}>
              Studio
            </SortHeaderCell>
          }
          cell={<TextCell data={sortedDataList} />}
          width={200}
        />
        <Column
          columnKey="prod.title.en"
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs['prod.title.en']}>
              Class Name
            </SortHeaderCell>
          }
          cell={<TextCell data={sortedDataList} />}
          width={200}
        />
        <Column
          columnKey="prod.from"
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs['prod.from']}>
              Class Time
            </SortHeaderCell>
          }
          cell={<TextCell data={sortedDataList} isDate={true} />}
          width={200}
        />
        <Column
          columnKey="created"
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs['created']}>
              Order Time
            </SortHeaderCell>
          }
          cell={<TextCell data={sortedDataList} isDate={true} />}
          width={200}
        />
        <Column
          columnKey="user.nickname"
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs['user.nickname']}>
              User
            </SortHeaderCell>
          }
          cell={<TextCell data={sortedDataList} />}
          width={200}
        />
        <Column
          columnKey="passcode"
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs['passcode']}>
              Passcode
            </SortHeaderCell>
          }
          cell={<TextCell data={sortedDataList} />}
          width={200}
        />
        <Column
          columnKey="status"
          header={
            <SortHeaderCell
              onSortChange={this._onSortChange}
              sortDir={colSortDirs['status']}>
              Status
            </SortHeaderCell>
          }
          cell={<TextCell data={sortedDataList} />}
          width={150}
        />
      </Table>
    );
  }
}


module.exports = Orders;
