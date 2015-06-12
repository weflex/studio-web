'use strict';

describe('Controller AddClassCtrl', function() {
  var ctrl, scope, mockClassesResource, saveDeferred, adminRouteHelper;

  beforeEach(module('weflexAdmin'));

  beforeEach(inject(function($q) {
    mockClassesResource = {
      save: function() {
        saveDeferred = $q.defer();
        return {$promise: saveDeferred.promise};
      }
    };

    spyOn(mockClassesResource, 'save').and.callThrough();
  }));

  beforeEach(inject(function($rootScope, $controller, _adminRouteHelper_) {
    scope = $rootScope.$new();
    adminRouteHelper = _adminRouteHelper_;
    ctrl = $controller('AddClassCtrl', {
      $scope: scope,
      Classes: mockClassesResource,
      adminRouteHelper: _adminRouteHelper_
    });
  }));

  it('should save class if form is valid', function() {
    scope.classForm = {
      $valid: true
    };
    scope.class = {id: 'testId'};

    spyOn(adminRouteHelper, 'toHome');

    scope.onSubmit();
    saveDeferred.resolve();
    scope.$apply();

    expect(mockClassesResource.save).toHaveBeenCalledWith({id: 'testId'});
    expect(adminRouteHelper.toHome).toHaveBeenCalled();
  });

  it('should not save class if form is invalid', function() {
    scope.classForm = {
      $valid: false
    };

    scope.onSubmit();
    expect(mockClassesResource.save).not.toHaveBeenCalled();
  });
});