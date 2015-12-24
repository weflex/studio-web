"use strict";
const React = require('react');
const Tabular = require('../sorted/table');
const Class = require('../api/class');
const {
  SearchInput
} = require('../toolbar/components/search');

class ClassList extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const table = this.refs.table;
    SearchInput.Listen('onChange', table.filter.bind(table));
  }
  async getDataSource() {
    return await Class.list();
  }
  render() {
    return (
      <Tabular
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
      </Tabular>
    );
  }
}

module.exports = ClassList;
