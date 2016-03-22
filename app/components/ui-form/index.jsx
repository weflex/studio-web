"use strict";

import UIBase         from './src/base';
import UIButton       from './src/button/base';
import UITextInput    from './src/input/text';
import UIFileInput    from './src/input/file';
import UIDateInput    from './src/input/date';
import UITimeInput    from './src/input/time';
import UIOptionPicker from './src/picker/option';
import UIColorPicker  from './src/picker/color';

module.exports = Object.assign({
  UIButton,
  UITextInput,
  UIFileInput,
  UIDateInput,
  UITimeInput,
  UIOptionPicker,
  UIColorPicker,
}, UIBase);
