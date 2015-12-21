'use strict';
const React = require('react');
const SortedTable = require('../sorted/table');
const Clazz = require('../api/class');
const { SearchInput } = require('../toolbar/components/search');

class ClassList extends SortedTable {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const table = this.refs.table;
    SearchInput.Listen('onChange', table.filter.bind(table));
  }
  async getDataSource() {
    return await Clazz.list();
  }
  render() {
    return (
      <SortedTable
        ref="table"
        getDataSource={this.getDataSource}
        tableHeight={window.innerHeight - 50}
        tableWidth={window.innerWidth - 100}
        columns={[
          {
            title: '分类',
            key: 'category'
          },
          {
            title: '工作室',
            key: 'venue.name.en'
          },
          {
            title: '标题',
            key: 'title.en'
          },
          {
            title: '开课时间',
            key: 'from',
            type: 'date'
          },
          {
            title: '私教课程',
            key: 'properties.isPTrainer',
            type: 'bool'
          },
          {
            title: '女士专场',
            key: 'properties.isForLadies',
            type: 'bool'
          }
        ]}>
      </SortedTable>
    );
  }
}

module.exports = ClassList;
