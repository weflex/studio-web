(function() {
'use strict';

angular.module('weflexAdmin')
  .factory('Venues', ['$resource', 'wfConfig', function($resource, wfConfig){
    var baseUrl = wfConfig.BASE_URL.API + '/api';

    var paramDefaults = {
      venueId: '@venueId'
    };

    return $resource(baseUrl + '/venues/:venueId', paramDefaults);
  }]);
})();