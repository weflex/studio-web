'use strict';

describe('Controller EditClassCtrl', function() {
  var ctrl, scope, mockClassResource, mockAdminRouteHelper, adminRouteHelper, getDeferred, updateDeferred;

  beforeEach(module('weflexAdmin'));

  beforeEach(inject(function($q) {
    mockClassResource = {
      get: function() {
        getDeferred = $q.defer();
        return {$promise: getDeferred.promise};
      },
      update: function() {
        updateDeferred = $q.defer();
        return {$promise: updateDeferred.promise};
      }
    };
    spyOn(mockClassResource, 'get').and.callThrough();
    spyOn(mockClassResource, 'update').and.callThrough();
  }));

  beforeEach(inject(function($rootScope, $controller, _adminRouteHelper_) {
    scope = $rootScope.$new();
    adminRouteHelper = _adminRouteHelper_;
    ctrl = $controller('EditClassCtrl', {
      $scope: scope,
      Classes: mockClassResource,
      $routeParams: {
        classId: 'testId'
      },
      'adminRouteHelper': _adminRouteHelper_
    });
    getDeferred.resolve({id: 'testId'});
    $rootScope.$apply();
  }));

  it('should get the class whose id is testId', function() {
    expect(mockClassResource.get).toHaveBeenCalledWith({classId: 'testId'});
    expect(scope.class).toEqual({id: 'testId'});
  });

  it('should update the class on submit event fired and form is valid', function() {
    spyOn(adminRouteHelper, 'toHome');

    scope.classForm = {
      $valid: true
    };
    scope.onSubmit();

    updateDeferred.resolve();
    scope.$apply();

    expect(mockClassResource.update).toHaveBeenCalledWith({classId: 'testId'}, scope.class);
    expect(adminRouteHelper.toHome).toHaveBeenCalled();
  });

  it('should not update the class when form is invalid', function() {
    scope.classForm = {
      $valid: false
    };
    scope.onSubmit();

    expect(mockClassResource.update).not.toHaveBeenCalled();
  });
});