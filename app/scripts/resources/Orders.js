(function() {
'use strict';

angular.module('weflexAdmin')
  .factory('Orders', ['$resource', 'wfConfig', function($resource, wfConfig){
    var baseUrl = wfConfig.BASE_URL.API + '/api';
    var paramDefaults = {
      orderId: '@orderId'
    };

    var byClassResource = $resource(baseUrl + '/classes/:classId/paid', {
      classId: '@classId'
    });
    var resource = $resource(baseUrl + '/orders/:orderId', paramDefaults);

    resource.byClass = byClassResource.get.bind(byClassResource);

    return resource;
  }])
})();