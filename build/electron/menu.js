"use strict";

const electron = require('electron');
const Menu = electron.remote.Menu;

var template = [
  {
    label: '窗口',
    role: 'window',
    submenu: [
      {
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: '关闭窗口',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: '编辑',
    role: 'edit',
    submenu: [
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: '全屏',
        accelerator: (function() {
          if (process.platform == 'darwin') {
            return 'Ctrl+Command+F';
          } else {
            return 'F11';
          }
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.setFullScreen(
              !focusedWindow.isFullScreen());
          }
        }
      },
      {
        label: '开发者工具',
        accelerator: (function() {
          if (process.platform == 'darwin') {
            return 'Alt+Command+I';
          } else {
            return 'Ctrl+Shift+I';
          }
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      },
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '了解更多',
        click: function() { 
          electron.shell.openExternal('http://www.getweflex.com');
        }
      },
    ]
  },
];

if (process.platform == 'darwin') {
  var name = electron.remote.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: '关于',
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: '服务',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: '隐藏 ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: '隐藏其他',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: '显示所有',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: '重新登录',
        click: function() {
          electron.remote.app.mainWindow.loadURL('http://demo.getweflex.com/login');
        }
      },
      {
        label: '退出',
        accelerator: 'Command+Q',
        click: function() { 
          electron.remote.app.quit(); 
        }
      },
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

Menu.setApplicationMenu(
  Menu.buildFromTemplate(template));
