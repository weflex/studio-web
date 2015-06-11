'use strict';

describe('Controller AddClassCtrl', function() {
  var baseUrl = weflex.env.API_URL;
  var ctrl, scope, adminRouter, $httpBackend;

  beforeEach(module('weflexAdmin'));

  beforeEach(inject(function($controller, $rootScope, _$httpBackend_, _adminRouteHelper_) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    ctrl = $controller('AddClassCtrl', {
      '$scope': scope
    });
    adminRouter = _adminRouteHelper_;
  }));

  it('should save new added class when form is valid and route to home after adding class success', function() {
    scope.class = {};
    scope.classForm = {
      $valid: true
    };

    $httpBackend.whenPOST(baseUrl + '/api/classes').respond(200);
    $httpBackend.expectPOST(baseUrl + '/api/classes');

    spyOn(adminRouter, 'toHome');
    scope.onSubmit();

    $httpBackend.flush();

    expect(adminRouter.toHome).toHaveBeenCalled();
  });

  it('should not request to save class when form is invalid', function() {
    scope.class = {};
    scope.classForm = {
      $valid: false
    };

    scope.onSubmit();

  });
});