'use strict';

angular.module('weflexAdmin')
.factory('wfDebug', ['wfConfig', function(wfConfig) {
  return {
    log: function(msg) {
      if (!wfConfig.debug.on) {
        return;
      }

      if (wfConfig.debug.quiet) {
        console.log('DEBUG LOG: ' + msg);
      } else {
        alert('DEBUG LOG: ' + msg);
      }
    },
    info: function(msg, mobile) {
      if (!wfConfig.debug) {
        return;
      }

      if (wfConfig.debug.quiet) {
        console.info('DEBUG INFO: ' + msg);
      } else {
        alert('DEBUG INFO:' + msg);
      }
    },
    error: function(msg, mobile) {
      if (!wfConfig.debug) {
        return;
      }

      if (wfConfig.debug.quiet) {
        console.error('DEBUG ERROR: ' + msg);
      } else {
        alert('DEBUG ERROR: ' + msg);
      }
    }
  }
}])