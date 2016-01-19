"use strict";

const React = require('react');
// const FlatButton = require('material-ui/lib/flat-button');
// const TextField = require('material-ui/lib/text-field');
// const SelectField = require('material-ui/lib/select-field');
// const MenuItem = require('material-ui/lib/menus/menu-item');
// const Toggle = require('material-ui/lib/toggle');

class CardDetail extends React.Component {
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
      },
      form: {
        display: 'inline-block',
        width: '60%'
      },
      fieldset: {
        display: 'block',
      },
      label: {
        display: 'inline-block',
        width: '20%',
      },
      controls: {
        display: 'inline-block',
        width: '40%',
      },
      description: {
        display: 'inline-block',
        width: '40%',
        color: '#898989'
      },
      preview: {
        display: 'inline-block',
        float: 'right',
        width: 300,
        paddingTop: 10,
      },
      preview1: {
        backgroundColor: '#eee',
        height: 100
      },
      preview2: {
        backgroundColor: '#eee',
        height: 180
      }
    };
    this.state = {
      cardType: 0,
      countType: 0,
      expireType: 0,
      pricesCount: 0,
      delayCount: 0,
      // data
      cardTypeList: [
        '年卡',
        '次卡',
        '月卡'
      ],
    };
  }
  render() {
    var pricesControl = [];
    for (let i = 0; i < this.state.pricesCount + 1; i++) {
      pricesControl.push(
        <div></div>
      );
    }
    return (
      <div style={this.styles.container}>
      </div>
    );
  }
}

module.exports = CardDetail;