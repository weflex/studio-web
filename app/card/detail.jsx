"use strict";

const React = require('react');
const FlatButton = require('material-ui/lib/flat-button');
const TextField = require('material-ui/lib/text-field');
const SelectField = require('material-ui/lib/select-field');
const MenuItem = require('material-ui/lib/menus/menu-item');
const Toggle = require('material-ui/lib/toggle');

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
        <div>
          <TextField style={{width: '40%', display: 'inline-block', marginRight: '5%'}} hintText="价格名称" />
          <TextField style={{width: '40%', display: 'inline-block'}} hintText="价格" />
        </div>
      );
    }
    return (
      <div style={this.styles.container}>
        <div style={this.styles.header}>
          <h1 style={this.styles.title}>创建新卡</h1>
        </div>
        <div style={this.styles.contents}>
          <form style={this.styles.form}>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}>新卡名称＊</label>
              <div style={this.styles.controls}>
                <TextField />
              </div>
              <div style={this.styles.description}>
                请给您的卡取个简单易懂的名字
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}>次数选择＊</label>
              <div style={this.styles.controls}>
                <SelectField value={this.state.countType}
                  onChange={(event, index) => {
                    this.setState({ countType: index });
                  }}>
                  <MenuItem key={0} value={0} primaryText="一次" />
                  <MenuItem key={1} value={1} primaryText="多次" />
                  <MenuItem key={2} value={2} primaryText="不限" />
                </SelectField>
              </div>
              <div style={this.styles.description}>
                设定该健身卡属于一次、多次还是无限次数
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}>有效期＊</label>
              <div style={this.styles.controls}>
                <TextField defaultValue={1} style={{width: '40%', display: 'inline-block', marginRight: '5%'}} />
                <SelectField value={this.state.expireType}
                  onChange={(event, index) => {
                    this.setState({ expireType: index });
                  }}
                  style={{width: '40%', display: 'inline-block', marginRight: '5%'}}>
                  <MenuItem key={0} value={0} primaryText="天" />
                  <MenuItem key={1} value={1} primaryText="周" />
                  <MenuItem key={2} value={2} primaryText="月" />
                </SelectField>
              </div>
              <div style={this.styles.description}>
                设定该卡的有效期
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}>价格类型</label>
              <div style={this.styles.controls}>
                <SelectField value={this.state.pricesCount} onChange={(event, index) => {
                  this.setState({ pricesCount: index });
                }}>
                  <MenuItem key={0} value={0} primaryText="一个价格" />
                  <MenuItem key={1} value={1} primaryText="两个价格" />
                </SelectField>
              </div>
              <div style={this.styles.description}>
                针对不同类型的客人，有不同的价格，可以在这里选择
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}></label>
              <div style={this.styles.controls}>
                {pricesControl}
              </div>
              <div style={this.styles.description}>
                描述用户类型（比如会员／非会员）与价格
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}>延期次数＊</label>
              <div style={this.styles.controls}>
                <SelectField value={this.state.delayCount} onChange={(event, index) => {
                  this.setState({ delayCount: index })
                }}>
                  <MenuItem key={0} value={0} primaryText="不能延期" label="不能延期" />
                  <MenuItem key={1} value={1} primaryText="1次" label="1次" />
                  <MenuItem key={2} value={2} primaryText="2次" label="2次" />
                </SelectField>
              </div>
              <div style={this.styles.description}>
                您的会员可能因为各种情况需要延长卡的有效期，您可以在这里设置延长次数
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}>描述＊</label>
              <div style={this.styles.controls}>
                <TextField multiLine={true} />
              </div>
              <div style={this.styles.description}>
                 您可以在这里添加更多关于该卡的信息
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}>所属种类＊</label>
              <div style={this.styles.controls}>
                <SelectField value={this.state.cardType}
                  onChange={(event, index) => {
                    this.setState({ cardType: index });
                  }}>
                  {this.state.cardTypeList.map((item, index) => {
                    return <MenuItem key={index} value={index} primaryText={item} />;
                  })}
                </SelectField>
              </div>
              <div style={this.styles.description}>
                您可以为这张卡或其他创建过的卡整理归类，只支持单选，可以删除预定义的类别
              </div>
            </div>
            <div style={this.styles.fieldset}>
              <label style={this.styles.label}></label>
              <div style={this.styles.controls}>
                <TextField style={{width: '40%', display: 'inline-block', marginRight: '5%'}} 
                  ref="newtype"
                />
                <FlatButton label="＋添加新类别"
                  onTouchTap={event => {
                    const newtypeVal = this.refs.newtype.getValue();
                    const list = this.state.cardTypeList;
                    if (newtypeVal && list.indexOf(newtypeVal) === -1) {
                      list.push(newtypeVal);
                      this.refs.newtype.setValue('');
                      this.setState({
                        cardType: list.length - 1,
                        cardTypeList: list,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </form>
          <div style={this.styles.preview}>
            <h3 style={this.styles.title}>卡片预览</h3>
            <div style={this.styles.preview1}></div>
            <h3 style={this.styles.title}>详情预览</h3>
            <div style={this.styles.preview2}></div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = CardDetail;