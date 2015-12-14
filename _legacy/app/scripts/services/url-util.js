'use strict';

angular.module('weflexAdmin')
.factory('wfUrlUtil', ['$sce', function($sce) {

  //TODO: Test
  function _url(path, query, hash) {

    var _resultUrl;

    if (angular.equals(query, {})) {
      return path;
    } else {
      _resultUrl = path + '?';
    }

    angular.forEach(query, function(value, key) {
      _resultUrl = (_resultUrl + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&');
    });

    _resultUrl = _resultUrl.substring(0, _resultUrl.length - 1);

    if (hash) {
      _resultUrl += '#' + hash;
    }

    return _resultUrl;

  }

  return {
    concatUrl: function(path, query, hash) {
      return _url(path, query, hash);
    },
    sce: {
      trustAsResourceUrl: function(path, query, hash) {
        return $sce.trustAsResourceUrl(_url(path, query, hash));
      }
    }
  }

}])
