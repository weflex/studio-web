"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../api';

const style = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flexGrow: '1',
    height: '95%',
  },
  box: {
    width: '400px',
    height: '360px',
  },
  text: {
    fontSize: '16px',
    color: '#808080',
    marginBottom: '20px',
  },
  downloadButton: {
    width: '241px',
    height: '44px',
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#6ed4a4',
    margin: '10px',
    cursor: 'pointer',
  },
  uploadButton: {
    width: '241px',
    height: '44px',
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#00e4ff',
    margin: '10px',
    cursor: 'pointer',
  },
  uploadButtonDisable: {
    width: '241px',
    height: '44px',
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#d8d8d8',
    margin: '10px',
    cursor: 'pointer',
  }
};

export default class Importer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: false,
      percent: 0,
    };
  }
  
  async handleFile(e) {
    let successCount = 0;
    const failureCase = [];
 
    try {
      this.setState({
        progress: true,
      });
      
      const files = e.target.files;
      const file = files[0];
      const data = await client.middleware('/import-members/parse', file, 'post');    
      
      const length = data.length;
      if (!length) {
        throw new Error('没有数据');
      }
      
      data.map((row) => {
        if (row.hasOwnProperty('sex')) {
          if (row['sex'] === 'male' || row['sex'].match('男')) {
            row['sex'] = 'male';
          } else {
            row['sex'] = 'female';
          }
        }
      });
      
      const phones = {};
      data.forEach((row) => {
        if (row.hasOwnProperty('phone')) {
          const phone = row['phone'];
          if (/^[0-9]{11}$/.test(phone)) {
            if (phones.hasOwnProperty(phone)) {
              throw new Error(`手机号是 WeFlex 平台识别您会员的唯一方式，必须是唯一的 ${phone}`);
            } else {
              phones[phone] = true;
            }
          } else {
            throw new TypeError(`手机号码请务必填写真实、有效的11位手机号 ${phone} `);
          }
        } else {
          throw new TypeError('手机号码是必填的');
        }
      });
     
      const venue = await client.user.getVenueById();
      await Promise.all(data.map((row, index) => {
        return (async () => {
          try {
            const response = await client.middleware('/transaction/add-member', Object.assign({
              venueId: venue.id,
            }, row), 'post');
            if (!response || !response.user) {
              throw new Error('Internal Server Error');
            }
            successCount = successCount + 1;
            this.setState({
              percent: Math.floor(successCount * 100 / length),
            });
          } catch (err){
            failureCase.push({
              data: row,
              error: err,
            });
          }
        })();
      }));
    } catch (err) {
      console.error(err && err.stack);
      UIFramework.Modal.error({
        title: '错误',
        content: err.message,
        onOk: () => location.href = '/member',
      });
    } finally {
      if (successCount && failureCase.length === 0) {
        UIFramework.Modal.success({
          title: '导入成功',
          content: `成功导入了 ${successCount} 个会员`,
          onOk: () => location.href = '/member',
        });
      } else if (failureCase.length) {
        const failure = failureCase.reduce((prev, curr) => {
          return prev + JSON.stringify(curr.data, null, ' ') + curr.error.message;
        }, '');
        UIFramework.Modal.error({
          title: '导入失败',
          content: `成功导入了 ${successCount} 个会员 失败了 ${failureCase.length} 次 ${failure}`,
          onOk: () => location.href = '/member',
        });
      }
    }
    
  }
  render() {
    return ( 
      <div style={style.root}>
        <div style={style.progress}>
          {this.state.progress ? <UIFramework.Progress flex={1} percent={this.state.percent}/> : null}
        </div>
        <div style={style.container}>
          <div style={style.box}>     
            <img src={require('./people.svg')} />
            <p style={style.text}>
              暂时还没有会员，您可以批量导入或是逐个添加新用户。<br/>
              为了方便您快速导入现有会员信息，我们为您准备了Excel模板。<br/>
              您可以下载 Excel 模板，填入会员信息并上传。<br/>
            </p>
            <a href='http://assets.theweflex.com/Import%20Template.xlsx' download><button style={style.downloadButton}>下载 Excel 模板</button></a>
            <input ref='file' type='file' onChange={this.handleFile.bind(this)} hidden/>
            <button 
              style={this.state.progress ? style.uploadButtonDisable:style.uploadButton} 
              onClick={()=>{this.refs.file.click()}}
              disabled={this.state.progress}>
              上传 Excel 表单
            </button>
          </div>
        </div>
      </div>
    );
  }
}