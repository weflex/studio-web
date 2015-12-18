'use strict';
const React = require('react');
const Moment = require('moment');
const { 
  Table, 
  Column, 
  Cell
} = require('fixed-data-table');

var SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function reverseSortDirection (sortDir) {
  return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
}

function getValueByNamespace (obj, namespace, type) {
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
  if (type === 'date') {
    return Moment(curr).fromNow();
  } else if (type === 'bool') {
    return curr ? 'Yes' : 'No';
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

const TextCell = ({rowIndex, data, columnKey, type, ...props}) => (
  <Cell {...props}>
    {getValueByNamespace(
      data.getObjectAt(rowIndex),
      columnKey,
      type
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

class SortedTable extends React.Component {
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
    if (typeof this.props.getDataSource === 'function') {
      this._dataList = await this.props.getDataSource();
      this._index.call(this);
      this.setState({
        sortedDataList: new DataListWrapper(this._defaultSortIndexes, this._dataList)
      });
    }
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
  renderColumn(data) {
    return (
      <Column
        key={data.key}
        columnKey={data.key}
        header={
          <SortHeaderCell
            onSortChange={this._onSortChange}
            sortDir={this.state.colSortDirs[data.key]}>
            {data.title}
          </SortHeaderCell>
        }
        cell={<TextCell data={this.state.sortedDataList} type={data.type} />}
        width={200}
      ></Column>
    );
  }
  render() {
    return (
      <Table
        rowHeight={50}
        rowsCount={this.state.sortedDataList.getSize()}
        headerHeight={50}
        width={window.innerWidth}
        height={window.innerHeight}
        {...this.props}>
        {this.props.columns.map(this.renderColumn.bind(this))}
      </Table>
    );
  }
}

module.exports = SortedTable;
